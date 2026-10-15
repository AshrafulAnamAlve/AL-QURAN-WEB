using System.Diagnostics;
using System.Net;
using AlQuran.Api.DTOs.Common;
using AlQuran.Api.Models.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace AlQuran.Api.Middleware;

/// <summary>
/// One place where every unhandled exception becomes a predictable
/// RFC 9457 ProblemDetails response. Without this, a failing upstream API
/// would surface in the browser as an opaque 500 with an HTML body, and the
/// Angular app could not tell "retry might help" from "this will never work".
/// </summary>
public sealed class ExceptionHandlingMiddleware
{
    public const string CorrelationHeader = "X-Correlation-Id";

    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;
    private readonly ProblemDetailsFactory _problemDetailsFactory;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment,
        ProblemDetailsFactory problemDetailsFactory)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
        _problemDetailsFactory = problemDetailsFactory;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = ResolveCorrelationId(context);
        context.Response.Headers[CorrelationHeader] = correlationId;

        try
        {
            await _next(context).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            await HandleAsync(context, ex, correlationId).ConfigureAwait(false);
        }
    }

    private async Task HandleAsync(HttpContext context, Exception exception, string correlationId)
    {
        // The browser navigated away or the request was aborted: nothing to report.
        if (exception is OperationCanceledException && context.RequestAborted.IsCancellationRequested)
        {
            _logger.LogInformation("Request {Path} was cancelled by the client", context.Request.Path);
            return;
        }

        if (context.Response.HasStarted)
        {
            _logger.LogError(
                exception,
                "Response already started for {Path}; cannot write an error payload",
                context.Request.Path);
            return;
        }

        var (status, code, title, detail, retryable, service) = Map(exception);

        if (status >= 500)
        {
            _logger.LogError(
                exception,
                "Unhandled failure on {Method} {Path} (correlation {CorrelationId})",
                context.Request.Method, context.Request.Path, correlationId);
        }
        else
        {
            _logger.LogWarning(
                "Request failed on {Method} {Path} with {Status}: {Detail} (correlation {CorrelationId})",
                context.Request.Method, context.Request.Path, status, detail, correlationId);
        }

        var problem = _problemDetailsFactory.CreateProblemDetails(
            context,
            statusCode: status,
            title: title,
            detail: detail);

        problem.Extensions[ApiErrorExtensionKeys.ErrorCode] = code;
        problem.Extensions[ApiErrorExtensionKeys.Retryable] = retryable;
        problem.Extensions[ApiErrorExtensionKeys.CorrelationId] = correlationId;

        if (service is not null)
        {
            problem.Extensions[ApiErrorExtensionKeys.Service] = service;
        }

        // Stack traces are a development-only convenience; never leak them in production.
        if (_environment.IsDevelopment())
        {
            problem.Extensions["exception"] = exception.GetType().Name;
            problem.Extensions["stackTrace"] = exception.StackTrace;
        }

        context.Response.Clear();
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/problem+json";
        context.Response.Headers[CorrelationHeader] = correlationId;

        await context.Response.WriteAsJsonAsync(problem, context.RequestAborted).ConfigureAwait(false);
    }

    private static (int Status, string Code, string Title, string Detail, bool Retryable, string? Service)
        Map(Exception exception) => exception switch
    {
        RequestValidationException validation => (
            StatusCodes.Status400BadRequest,
            ApiErrorCodes.ValidationFailed,
            "Invalid request",
            validation.Message,
            false,
            null),

        ResourceNotFoundException notFound => (
            StatusCodes.Status404NotFound,
            ApiErrorCodes.NotFound,
            "Not found",
            notFound.Message,
            false,
            null),

        ExternalApiException { UpstreamStatusCode: HttpStatusCode.TooManyRequests } upstream => (
            StatusCodes.Status429TooManyRequests,
            ApiErrorCodes.RateLimited,
            "Too many requests",
            upstream.Message,
            true,
            upstream.ServiceName),

        ExternalApiException { UpstreamStatusCode: HttpStatusCode.GatewayTimeout or HttpStatusCode.RequestTimeout } upstream => (
            StatusCodes.Status504GatewayTimeout,
            ApiErrorCodes.UpstreamTimeout,
            "Upstream timeout",
            upstream.Message,
            true,
            upstream.ServiceName),

        ExternalApiException { UpstreamStatusCode: HttpStatusCode.NotFound } upstream => (
            StatusCodes.Status404NotFound,
            ApiErrorCodes.NotFound,
            "Not found",
            upstream.Message,
            false,
            upstream.ServiceName),

        ExternalApiException upstream => (
            StatusCodes.Status502BadGateway,
            ApiErrorCodes.UpstreamUnavailable,
            "Upstream service error",
            upstream.Message,
            upstream.IsRetryable,
            upstream.ServiceName),

        TaskCanceledException or TimeoutException => (
            StatusCodes.Status504GatewayTimeout,
            ApiErrorCodes.UpstreamTimeout,
            "Request timed out",
            "The request took too long to complete. Please try again.",
            true,
            null),

        _ => (
            StatusCodes.Status500InternalServerError,
            ApiErrorCodes.Unexpected,
            "Something went wrong",
            "An unexpected error occurred. Please try again.",
            true,
            null),
    };

    private static string ResolveCorrelationId(HttpContext context)
    {
        if (context.Request.Headers.TryGetValue(CorrelationHeader, out var incoming))
        {
            var value = incoming.ToString();
            // Only trust a short, printable value from the client.
            if (value.Length is > 0 and <= 64 && value.All(c => char.IsLetterOrDigit(c) || c is '-' or '_'))
            {
                return value;
            }
        }

        return Activity.Current?.Id ?? context.TraceIdentifier;
    }
}

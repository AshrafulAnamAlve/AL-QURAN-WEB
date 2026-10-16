using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlQuran.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Bookmarks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SurahNumber = table.Column<int>(type: "int", nullable: false),
                    AyahNumber = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookmarks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DailyAyahLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DateUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SurahNumber = table.Column<int>(type: "int", nullable: false),
                    AyahNumber = table.Column<int>(type: "int", nullable: false),
                    SelectedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyAyahLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MosqueFeedbacks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MosqueId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MosqueName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    FeedbackText = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ContactEmail = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MosqueFeedbacks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserPreferences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false, defaultValue: "bn"),
                    ReciterId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "ar.alafasy"),
                    PrayerMethodId = table.Column<int>(type: "int", nullable: false),
                    Theme = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "system"),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPreferences", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bookmarks_SurahNumber_AyahNumber",
                table: "Bookmarks",
                columns: new[] { "SurahNumber", "AyahNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_DailyAyahLogs_DateUtc",
                table: "DailyAyahLogs",
                column: "DateUtc");

            migrationBuilder.CreateIndex(
                name: "IX_UserPreferences_ClientId",
                table: "UserPreferences",
                column: "ClientId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bookmarks");

            migrationBuilder.DropTable(
                name: "DailyAyahLogs");

            migrationBuilder.DropTable(
                name: "MosqueFeedbacks");

            migrationBuilder.DropTable(
                name: "UserPreferences");
        }
    }
}

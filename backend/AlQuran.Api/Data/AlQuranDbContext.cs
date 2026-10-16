using AlQuran.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace AlQuran.Api.Data;

public class AlQuranDbContext : DbContext
{
    public AlQuranDbContext(DbContextOptions<AlQuranDbContext> options)
        : base(options)
    {
    }

    public DbSet<UserBookmark> Bookmarks => Set<UserBookmark>();
    public DbSet<UserPreference> Preferences => Set<UserPreference>();
    public DbSet<MosqueFeedback> MosqueFeedbacks => Set<MosqueFeedback>();
    public DbSet<DailyAyahLog> DailyAyahLogs => Set<DailyAyahLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserBookmark>(entity =>
        {
            entity.ToTable("Bookmarks");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.SurahNumber, e.AyahNumber });
            entity.Property(e => e.Note).HasMaxLength(1000);
        });

        modelBuilder.Entity<UserPreference>(entity =>
        {
            entity.ToTable("UserPreferences");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ClientId).IsUnique();
            entity.Property(e => e.ClientId).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Language).HasMaxLength(10).HasDefaultValue("bn");
            entity.Property(e => e.ReciterId).HasMaxLength(50).HasDefaultValue("ar.alafasy");
            entity.Property(e => e.Theme).HasMaxLength(20).HasDefaultValue("system");
        });

        modelBuilder.Entity<MosqueFeedback>(entity =>
        {
            entity.ToTable("MosqueFeedbacks");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MosqueId).HasMaxLength(100).IsRequired();
            entity.Property(e => e.MosqueName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.FeedbackText).HasMaxLength(2000).IsRequired();
            entity.Property(e => e.ContactEmail).HasMaxLength(100);
        });

        modelBuilder.Entity<DailyAyahLog>(entity =>
        {
            entity.ToTable("DailyAyahLogs");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.DateUtc);
        });
    }
}

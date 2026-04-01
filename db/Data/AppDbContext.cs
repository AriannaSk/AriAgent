using db.Data.Configurations;
using db.Models;
using Microsoft.EntityFrameworkCore;

namespace db.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Maja> Majas => Set<Maja>();
    public DbSet<Dzivoklis> Dzivokli => Set<Dzivoklis>();
    public DbSet<Iedzivotajs> Iedzivotaji => Set<Iedzivotajs>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Leasehold> Leaseholds => Set<Leasehold>();
    public DbSet<BillingInput> BillingInputs => Set<BillingInput>();
    public DbSet<ServiceReading> ServiceReadings => Set<ServiceReading>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Ignore<System.Diagnostics.Metrics.Meter>();
        modelBuilder.ApplyConfiguration(new MajaConfiguration());
        modelBuilder.ApplyConfiguration(new DzivoklisConfiguration());
        modelBuilder.ApplyConfiguration(new IedzivotajsConfiguration());
        modelBuilder.ApplyConfiguration(new ServiceConfiguration());
        modelBuilder.ApplyConfiguration(new InvoiceConfiguration());
        modelBuilder.ApplyConfiguration(new LeaseholdConfiguration());

        modelBuilder.Entity<Dzivoklis>()
            .HasMany(d => d.Iedzivotaji)
            .WithMany(i => i.Dzivokli)
            .UsingEntity(j => j.ToTable("DzivoklisIedzivotajs"));

        modelBuilder.Entity<User>()
        .HasOne(u => u.Iedzivotajs)
        .WithOne(i => i.User)
        .HasForeignKey<User>(u => u.IedzivotajsId)
        .OnDelete(DeleteBehavior.Restrict);

        base.OnModelCreating(modelBuilder);
    }
}
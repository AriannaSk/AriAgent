using db.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace db.Data.Configurations;

public class LeaseholdConfiguration : IEntityTypeConfiguration<Leasehold>
{
    public void Configure(EntityTypeBuilder<Leasehold> builder)
    {
        builder.ToTable("Leaseholds");

        builder.HasKey(l => l.Id);

        builder.HasOne(l => l.Apartment)
            .WithMany()
            .HasForeignKey(l => l.ApartmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(l => l.Maja)
            .WithMany()
            .HasForeignKey(l => l.MajaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
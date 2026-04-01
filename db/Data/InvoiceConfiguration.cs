using db.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace db.Data.Configurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.InvoiceIdentifier)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.Period)
            .IsRequired()
            .HasMaxLength(7);

        builder.Property(i => i.Total)
            .HasColumnType("decimal(18,2)");

        builder.Property(i => i.ApartmentId)
            .IsRequired();

        builder.HasOne(i => i.Apartment)
            .WithMany()
            .HasForeignKey(i => i.ApartmentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
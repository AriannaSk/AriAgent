using db.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace db.Data.Configurations;

public class ServiceConfiguration : IEntityTypeConfiguration<Service>
{
    public void Configure(EntityTypeBuilder<Service> builder)
    {
        builder.ToTable("Services");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Nosaukums)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Tarifs)
            .IsRequired()
            .HasColumnType("decimal(10,2)");

        builder.Property(s => s.Nodoklis)
            .HasColumnType("decimal(5,2)");

        builder.Property(s => s.Formula)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasIndex(s => s.Nosaukums);
    }
}
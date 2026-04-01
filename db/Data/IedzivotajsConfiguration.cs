using db.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace db.Data.Configurations;

public class IedzivotajsConfiguration : IEntityTypeConfiguration<Iedzivotajs>
{
    public void Configure(EntityTypeBuilder<Iedzivotajs> builder)
    {
        builder.ToTable("Iedzivotaji");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Vards)
            .IsRequired()
            .HasMaxLength(60);

        builder.Property(x => x.Uzvards)
            .IsRequired()
            .HasMaxLength(60);

        builder.Property(x => x.PersonasKods)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.Telefons)
            .HasMaxLength(20);

        builder.Property(x => x.Epasts)
            .HasMaxLength(100);

        builder.Property(x => x.IsOwner)
            .HasDefaultValue(false);

        builder.HasIndex(x => x.PersonasKods)
            .IsUnique();
    }
}
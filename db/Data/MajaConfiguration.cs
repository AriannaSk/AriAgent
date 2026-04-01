using db.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace db.Data.Configurations;

public class MajaConfiguration : IEntityTypeConfiguration<Maja>
{
    public void Configure(EntityTypeBuilder<Maja> builder)
    {
        builder.ToTable("Majas");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Numurs)
               .IsRequired();

        builder.Property(x => x.Iela)
               .IsRequired()
               .HasMaxLength(100);

        builder.Property(x => x.Pilseta)
               .IsRequired()
               .HasMaxLength(60);

        builder.Property(x => x.Valsts)
               .IsRequired()
               .HasMaxLength(60);

        builder.Property(x => x.PastaIndekss)
               .IsRequired()
               .HasMaxLength(20);

        builder.HasMany(x => x.Dzivokli)
               .WithOne(x => x.Maja!)
               .HasForeignKey(x => x.MajaId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
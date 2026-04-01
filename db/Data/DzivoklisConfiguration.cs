using db.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace db.Data.Configurations;

public class DzivoklisConfiguration : IEntityTypeConfiguration<Dzivoklis>
{
    public void Configure(EntityTypeBuilder<Dzivoklis> builder)
    {
        builder.ToTable("Dzivokli");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Numurs)
               .IsRequired();

        builder.HasOne(x => x.Maja)
               .WithMany(m => m.Dzivokli)
               .HasForeignKey(x => x.MajaId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
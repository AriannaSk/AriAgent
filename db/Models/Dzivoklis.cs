using db.Models;
using System.ComponentModel.DataAnnotations;

public class Dzivoklis
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Range(1, 1000)]
    public int Numurs { get; set; }

    [Range(0, 100)]
    public int Stavs { get; set; }

    [Range(1, 10)]
    public int IstabuSkaits { get; set; }

    [Range(0, 20)]
    public int IedzivotajuSkaits { get; set; }

    [Required]
    [Range(1, 1000)]
    public double PilnaPlatiba { get; set; }

    [Required]
    [Range(1, 1000)]
    public double DzivojamaPlatiba { get; set; }

    // lodžija
    [Range(0, 200)]
    public double LodzijasPlatiba { get; set; }

    // ūdens patēriņš
    [Range(0, 1000)]
    public double UdensM3 { get; set; }

    public Guid MajaId { get; set; }

    public Maja? Maja { get; set; }

    public List<Iedzivotajs> Iedzivotaji { get; set; } = new();
}
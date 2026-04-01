using System.ComponentModel.DataAnnotations;

public class DzivoklisCreateDto
{
    [Required]
    [Range(1, 1000, ErrorMessage = "Apartment number must be between 1 and 1000")]
    public int Numurs { get; set; }

    [Range(0, 100)]
    public int Stavs { get; set; }

    [Range(1, 10)]
    public int IstabuSkaits { get; set; }

    [Range(0, 20)]
    public int IedzivotajuSkaits { get; set; }

    [Range(1, 1000)]
    public double PilnaPlatiba { get; set; }

    [Range(1, 1000)]
    public double DzivojamaPlatiba { get; set; }

    [Range(0, 200)]
    public double LodzijasPlatiba { get; set; }

    [Range(0, 1000)]
    public double UdensM3 { get; set; }

    [Required]
    public Guid MajaId { get; set; }

    public List<Guid> IedzivotajsIds { get; set; } = new();
}
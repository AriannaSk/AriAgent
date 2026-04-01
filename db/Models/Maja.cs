using db.Models;
using System.ComponentModel.DataAnnotations;

public class Maja
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Range(1, int.MaxValue)]
    public int Numurs { get; set; }

    [Required]
    public string Iela { get; set; } = "";

    [Required]
    public string Pilseta { get; set; } = "";

    [Required]
    public string Valsts { get; set; } = "";

    [Required]
    [RegularExpression(@"^LV-\d{4}$", ErrorMessage = "Postal code must be LV-XXXX")]
    public string PastaIndekss { get; set; } = "";

    public List<Dzivoklis> Dzivokli { get; set; } = new();
}
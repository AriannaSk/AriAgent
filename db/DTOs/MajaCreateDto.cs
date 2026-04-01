using System.ComponentModel.DataAnnotations;

namespace db.DTOs;

public class MajaCreateDto
{
    [Required]
    [Range(1, int.MaxValue)]
    public int Numurs { get; set; }

    [Required]
    [StringLength(100)]
    public string Iela { get; set; } = "";

    [Required]
    [StringLength(100)]
    public string Pilseta { get; set; } = "";

    [Required]
    [StringLength(100)]
    public string Valsts { get; set; } = "";

    [Required]
    [RegularExpression(@"^LV-\d{4}$", ErrorMessage = "Postal code must be LV-XXXX")]
    public string PastaIndekss { get; set; } = "";
}
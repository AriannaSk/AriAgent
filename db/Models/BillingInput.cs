using System.ComponentModel.DataAnnotations;

namespace db.Models
{
    public class BillingInput
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ApartmentId { get; set; }

        public Dzivoklis? Apartment { get; set; }

        [Required]
        [RegularExpression(@"^\d{4}-\d{2}$")]
        public string Period { get; set; } = "";

        [Range(0, 100000)]
        public decimal WaterM3 { get; set; }

        [Range(0, 100000)]
        public decimal ElectricityKwh { get; set; }

        [Range(0, 100)]
        public int ResidentsCount { get; set; }

        [StringLength(300)]
        public string? Comment { get; set; }
    }
}
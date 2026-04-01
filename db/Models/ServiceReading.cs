using System.ComponentModel.DataAnnotations;

namespace db.Models
{
    public class ServiceReading
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ApartmentId { get; set; }

        public Dzivoklis? Apartment { get; set; }

        [Required]
        public Guid ResidentId { get; set; }

        public Iedzivotajs? Resident { get; set; }

        [Required]
        public Guid ServiceId { get; set; }

        public Service? Service { get; set; }

        [Required]
        [RegularExpression(@"^\d{4}-\d{2}$", ErrorMessage = "Period format must be YYYY-MM")]
        public string Period { get; set; } = "";

        [Range(0, 1000000)]
        public decimal PreviousValue { get; set; }

        [Range(0, 1000000)]
        public decimal CurrentValue { get; set; }

        [Range(0, 1000000)]
        public decimal Usage { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    }
}
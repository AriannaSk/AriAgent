using System.ComponentModel.DataAnnotations;

namespace db.Models
{
    public class Invoice
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [StringLength(50)]
        public string InvoiceIdentifier { get; set; } = "";

        [Required]
        [RegularExpression(@"^\d{4}-\d{2}$",
            ErrorMessage = "Period format must be YYYY-MM")]
        public string Period { get; set; } = "";

        [Range(0, 100000)]
        public decimal Total { get; set; }

        [Required]
        public Guid ApartmentId { get; set; }

        public Dzivoklis? Apartment { get; set; }

        public List<Service> Services { get; set; } = new();
    }
}
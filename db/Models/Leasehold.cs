using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Metrics;

namespace db.Models
{
    public class Leasehold
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ApartmentId { get; set; }

        public Dzivoklis? Apartment { get; set; }

        [Required]
        public Guid MajaId { get; set; }

        public Maja? Maja { get; set; }

        public List<Invoice> Invoices { get; set; } = new();

        public List<Service> Services { get; set; } = new();

        public List<Meter> Meters { get; set; } = new();
    }
}
namespace db.DTOs;

public class LeaseholdReadDto
{
    public Guid Id { get; set; }

    public Guid ApartmentId { get; set; }

    public Guid MajaId { get; set; }

    public DzivoklisShortDto Apartment { get; set; } = new();

    public List<InvoiceReadDto> Invoices { get; set; } = new();
}
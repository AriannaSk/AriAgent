namespace db.DTOs;

public class InvoiceReadDto
{
    public Guid Id { get; set; }

    public string InvoiceIdentifier { get; set; } = "";

    public string Period { get; set; } = "";

    public decimal Total { get; set; }

    public Guid ApartmentId { get; set; }
}
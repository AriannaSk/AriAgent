namespace db.DTOs;

public class ServiceReadDto
{
    public Guid Id { get; set; }

    public string Nosaukums { get; set; } = "";

    public decimal Tarifs { get; set; }

    public decimal Nodoklis { get; set; }

    public string Formula { get; set; } = "";
}
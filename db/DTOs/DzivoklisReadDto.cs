using db.DTOs;

public class DzivoklisReadDto
{
  public Guid Id { get; set; }

  public int Numurs { get; set; }

  public int Stavs { get; set; }

  public int IstabuSkaits { get; set; }

  public int IedzivotajuSkaits { get; set; }

  public double PilnaPlatiba { get; set; }

  public double DzivojamaPlatiba { get; set; }

  public double LodzijasPlatiba { get; set; }

  public double UdensM3 { get; set; }

  public Guid MajaId { get; set; }

  public string? MajaNosaukums { get; set; }

  public List<IedzivotajsReadDto> Iedzivotaji { get; set; } = new();
}

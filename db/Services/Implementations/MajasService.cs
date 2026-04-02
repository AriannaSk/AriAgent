using db.Data;
using db.Models;
using db.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace db.Services.Implementations;

public class MajasService : IMajasService
{
  private readonly AppDbContext _db;

  public MajasService(AppDbContext db)
  {
    _db = db;
  }

  public async Task<List<Maja>> GetAllAsync()
  {
    return await _db.Majas
        .AsNoTracking()
        .ToListAsync();
  }

  public async Task<Maja?> GetByIdAsync(Guid id)
  {
    return await _db.Majas
        .AsNoTracking()
        .FirstOrDefaultAsync(x => x.Id == id);
  }

  private async Task<bool> HouseExistsAsync(
      string iela,
      int numurs,
      string pilseta,
      string valsts,
      string pastaIndekss,
      Guid? excludeId = null)
  {
    var normalizedStreet = iela.Trim().ToLower();
    var normalizedCity = pilseta.Trim().ToLower();
    var normalizedCountry = valsts.Trim().ToLower();
    var normalizedPostalCode = pastaIndekss.Trim().ToLower();

    return await _db.Majas.AnyAsync(m =>
        m.Iela.ToLower() == normalizedStreet &&
        m.Numurs == numurs &&
        m.Pilseta.ToLower() == normalizedCity &&
        m.Valsts.ToLower() == normalizedCountry &&
        m.PastaIndekss.ToLower() == normalizedPostalCode &&
        (!excludeId.HasValue || m.Id != excludeId.Value));
  }

  public async Task<Maja> CreateAsync(Maja maja)
  {
    var exists = await HouseExistsAsync(
        maja.Iela,
        maja.Numurs,
        maja.Pilseta,
        maja.Valsts,
        maja.PastaIndekss
    );

    if (exists)
      throw new InvalidOperationException("House with this address already exists.");

    _db.Majas.Add(maja);
    await _db.SaveChangesAsync();
    return maja;
  }

  public async Task<bool> UpdateAsync(Guid id, Maja maja)
  {
    if (id != maja.Id)
      return false;

    var existing = await _db.Majas.FirstOrDefaultAsync(x => x.Id == id);

    if (existing == null)
      return false;

    var exists = await HouseExistsAsync(
        maja.Iela,
        maja.Numurs,
        maja.Pilseta,
        maja.Valsts,
        maja.PastaIndekss,
        id
    );

    if (exists)
      throw new InvalidOperationException("House with this address already exists.");

    existing.Iela = maja.Iela;
    existing.Numurs = maja.Numurs;
    existing.Pilseta = maja.Pilseta;
    existing.Valsts = maja.Valsts;
    existing.PastaIndekss = maja.PastaIndekss;

    await _db.SaveChangesAsync();
    return true;
  }

  public async Task<bool> DeleteAsync(Guid id)
  {
    var maja = await _db.Majas.FindAsync(id);
    if (maja is null)
      return false;

    _db.Majas.Remove(maja);
    await _db.SaveChangesAsync();
    return true;
  }
}

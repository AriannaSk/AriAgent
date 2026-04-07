using db.Data;
using db.DTOs;
using db.Models;
using db.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace db.Services.Implementations;

public class IedzivotajsService : IIedzivotajsService
{
    private readonly AppDbContext _db;

    public IedzivotajsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Iedzivotajs>> GetAllAsync()
    {
        return await _db.Iedzivotaji
            .Include(x => x.Dzivokli)
            .ThenInclude(d => d.Maja)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Iedzivotajs?> GetByIdAsync(Guid id)
    {
        return await _db.Iedzivotaji
            .Include(x => x.Dzivokli)
            .ThenInclude(d => d.Maja)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<Iedzivotajs> CreateAsync(Iedzivotajs iedzivotajs, List<Guid> dzivoklisIds)
    {
        _db.Iedzivotaji.Add(iedzivotajs);
        await _db.SaveChangesAsync();

        if (dzivoklisIds.Count > 0)
        {
            var apartments = await _db.Dzivokli
                .Where(d => dzivoklisIds.Contains(d.Id))
                .ToListAsync();

            foreach (var ap in apartments)
            {
                iedzivotajs.Dzivokli.Add(ap);
            }

            await _db.SaveChangesAsync();
        }

        return iedzivotajs;
    }

    public async Task<bool> UpdateAsync(Guid id, Iedzivotajs iedzivotajs, List<Guid> dzivoklisIds)
    {
        if (id != iedzivotajs.Id) return false;

        var existing = await _db.Iedzivotaji
            .Include(x => x.Dzivokli)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (existing is null) return false;

        existing.Vards = iedzivotajs.Vards;
        existing.Uzvards = iedzivotajs.Uzvards;
        existing.PersonasKods = iedzivotajs.PersonasKods;
        existing.Telefons = iedzivotajs.Telefons;
        existing.Epasts = iedzivotajs.Epasts;
        existing.IsOwner = iedzivotajs.IsOwner;

        existing.Dzivokli.Clear();

        if (dzivoklisIds.Count > 0)
        {
            var apartments = await _db.Dzivokli
                .Where(d => dzivoklisIds.Contains(d.Id))
                .ToListAsync();

            foreach (var a in apartments)
                existing.Dzivokli.Add(a);
        }

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _db.Iedzivotaji
            .Include(x => x.Dzivokli)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity == null) return false;

        entity.Dzivokli.Clear();

        _db.Iedzivotaji.Remove(entity);

        await _db.SaveChangesAsync();

        return true;
    }
    public async Task<Iedzivotajs> CreateWithAccountAsync(ResidentAccountCreateDto dto)
    {
        var loginEmail = dto.LoginEmail.Trim().ToLower();
        var residentEmail = dto.Epasts.Trim();

        // 1. Проверка email
        var existingUser = await _db.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == loginEmail.ToLower());

        if (existingUser != null)
            throw new Exception("User with this login email already exists.");

        // 2. Проверка personas kods
        var existingResident = await _db.Iedzivotaji
            .FirstOrDefaultAsync(i => i.PersonasKods == dto.PersonasKods);

        if (existingResident != null)
            throw new Exception("Resident with this personal code already exists.");

        // 3. Загружаем квартиры
        var apartments = await _db.Dzivokli
            .Where(d => dto.DzivoklisIds.Contains(d.Id))
            .ToListAsync();

        if (apartments.Count != dto.DzivoklisIds.Count)
            throw new Exception("One or more apartments were not found.");

        // 4. Создаем жителя
        var resident = new Iedzivotajs
        {
            Vards = dto.Vards,
            Uzvards = dto.Uzvards,
            PersonasKods = dto.PersonasKods,
            Telefons = dto.Telefons,
            Epasts = residentEmail,
            IsOwner = dto.IsOwner,
            Dzivokli = apartments
        };

        _db.Iedzivotaji.Add(resident);
        await _db.SaveChangesAsync();

        // 5. Создаем user
        var user = new User
        {
            Email = loginEmail,
            Password = dto.Password,
            Role = "Resident",
            IedzivotajsId = resident.Id
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // 6. Связываем обратно (не обязательно, но полезно)
        resident.User = user;

        return resident;
    }
  public async Task<bool> CreateAccountForExistingResidentAsync(ResidentExistingAccountCreateDto dto)
  {
    var resident = await _db.Iedzivotaji
        .Include(r => r.User)
        .FirstOrDefaultAsync(r => r.Id == dto.ResidentId);

    if (resident == null)
      throw new Exception("Resident not found.");

    if (resident.User != null)
      throw new Exception("This resident already has an account.");

    var loginEmail = dto.LoginEmail.Trim().ToLower();

    var existingUser = await _db.Users
        .FirstOrDefaultAsync(u => u.Email.ToLower() == loginEmail);

    if (existingUser != null)
      throw new Exception("User with this login email already exists.");

    var user = new User
    {
      Email = loginEmail,
      Password = dto.Password,
      Role = "Resident",
      IedzivotajsId = resident.Id
    };

    _db.Users.Add(user);
    await _db.SaveChangesAsync();

    resident.User = user;
    await _db.SaveChangesAsync();

    return true;
  }
  public async Task<Iedzivotajs?> GetByUserIdAsync(Guid userId)
    {
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null || user.IedzivotajsId == null)
            return null;

        return await _db.Iedzivotaji
            .Include(x => x.Dzivokli)
            .ThenInclude(d => d.Maja)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == user.IedzivotajsId.Value);
    }
}

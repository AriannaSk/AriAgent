using db.Data;
using db.Models;
using db.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace db.Services.Implementations;

public class DzivoklisService : IDzivoklisService
{
    private readonly AppDbContext _db;

    public DzivoklisService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Dzivoklis>> GetAllAsync()
    {
        return await _db.Dzivokli
            .Include(x => x.Iedzivotaji)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Dzivoklis?> GetByIdAsync(Guid id)
    {
        return await _db.Dzivokli
            .Include(x => x.Iedzivotaji)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<List<Dzivoklis>> GetByHouseIdAsync(Guid houseId)
    {
        return await _db.Dzivokli
            .Include(x => x.Iedzivotaji)
            .Where(d => d.MajaId == houseId)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<List<Dzivoklis>> GetByUserIdAsync(Guid userId)
    {
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null || user.IedzivotajsId == null)
            return new List<Dzivoklis>();

        var resident = await _db.Iedzivotaji
            .Include(i => i.Dzivokli)
            .ThenInclude(d => d.Maja)
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == user.IedzivotajsId.Value);

        if (resident == null)
            return new List<Dzivoklis>();

        return resident.Dzivokli.ToList();
    }

    public async Task<Dzivoklis?> GetMyByIdAsync(Guid userId, Guid apartmentId)
    {
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null || user.IedzivotajsId == null)
            return null;

        var resident = await _db.Iedzivotaji
            .Include(i => i.Dzivokli)
            .ThenInclude(d => d.Maja)
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == user.IedzivotajsId.Value);

        if (resident == null)
            return null;

        return resident.Dzivokli.FirstOrDefault(d => d.Id == apartmentId);
    }

    public async Task<Dzivoklis> CreateAsync(Dzivoklis dzivoklis, List<Guid> iedzivotajsIds)
    {
        if (iedzivotajsIds.Count > 0)
        {
            var residents = await _db.Iedzivotaji
                .Where(r => iedzivotajsIds.Contains(r.Id))
                .ToListAsync();

            dzivoklis.Iedzivotaji = residents;
        }

        _db.Dzivokli.Add(dzivoklis);

        dzivoklis.IedzivotajuSkaits = dzivoklis.Iedzivotaji.Count;

        await _db.SaveChangesAsync();

        return dzivoklis;
    }

    public async Task<bool> UpdateAsync(Guid id, Dzivoklis dzivoklis, List<Guid> iedzivotajsIds)
    {
        if (id != dzivoklis.Id)
            return false;

        var existing = await _db.Dzivokli
            .Include(x => x.Iedzivotaji)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (existing == null)
            return false;

        existing.Numurs = dzivoklis.Numurs;
        existing.Stavs = dzivoklis.Stavs;
        existing.IstabuSkaits = dzivoklis.IstabuSkaits;
        existing.PilnaPlatiba = dzivoklis.PilnaPlatiba;
        existing.DzivojamaPlatiba = dzivoklis.DzivojamaPlatiba;
        existing.LodzijasPlatiba = dzivoklis.LodzijasPlatiba;
        existing.UdensM3 = dzivoklis.UdensM3;
        existing.MajaId = dzivoklis.MajaId;

        var residents = new List<Iedzivotajs>();

        if (iedzivotajsIds.Count > 0)
        {
            residents = await _db.Iedzivotaji
                .Where(r => iedzivotajsIds.Contains(r.Id))
                .ToListAsync();
        }

        existing.Iedzivotaji = residents;
        existing.IedzivotajuSkaits = residents.Count;

        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _db.Dzivokli
            .Include(x => x.Iedzivotaji)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity == null)
            return false;

        entity.Iedzivotaji.Clear();

        _db.Dzivokli.Remove(entity);

        await _db.SaveChangesAsync();

        return true;
    }
}
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

    public async Task<Maja> CreateAsync(Maja maja)
    {
        _db.Majas.Add(maja);
        await _db.SaveChangesAsync();
        return maja;
    }

    public async Task<bool> UpdateAsync(Guid id, Maja maja)
    {
        if (id != maja.Id) return false;

        _db.Entry(maja).State = EntityState.Modified;

        try
        {
            await _db.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            return await _db.Majas.AnyAsync(x => x.Id == id);
        }
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var maja = await _db.Majas.FindAsync(id);
        if (maja is null) return false;

        _db.Majas.Remove(maja);
        await _db.SaveChangesAsync();
        return true;
    }
}
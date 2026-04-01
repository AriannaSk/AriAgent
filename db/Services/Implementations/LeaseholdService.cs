using db.Data;
using db.Models;
using db.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace db.Services.Implementations;

public class LeaseholdService : ILeaseholdService
{
    private readonly AppDbContext _db;

    public LeaseholdService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Leasehold>> GetAllAsync()
    {
        return await _db.Leaseholds
            .Include(l => l.Apartment)
            .Include(l => l.Invoices)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Leasehold?> GetByIdAsync(Guid id)
    {
        return await _db.Leaseholds
            .Include(l => l.Apartment)
            .Include(l => l.Invoices)
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task<Leasehold> CreateAsync(Leasehold leasehold)
    {
        var apartment = await _db.Dzivokli
            .FirstOrDefaultAsync(a => a.Id == leasehold.ApartmentId);

        if (apartment == null)
            throw new Exception("Apartment not found");

        leasehold.MajaId = apartment.MajaId;

        _db.Leaseholds.Add(leasehold);

        await _db.SaveChangesAsync();

        return leasehold;
    }

    public async Task<bool> UpdateAsync(Guid id, Leasehold leasehold)
    {
        var existing = await _db.Leaseholds.FindAsync(id);

        if (existing == null)
            return false;

        existing.ApartmentId = leasehold.ApartmentId;

        var apartment = await _db.Dzivokli
            .FirstOrDefaultAsync(a => a.Id == leasehold.ApartmentId);

        if (apartment != null)
            existing.MajaId = apartment.MajaId;

        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _db.Leaseholds
            .Include(l => l.Invoices)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (entity == null)
            return false;

        _db.Leaseholds.Remove(entity);

        await _db.SaveChangesAsync();

        return true;
    }
}
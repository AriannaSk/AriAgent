using db.Data;
using db.Models;
using db.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace db.Services.Implementations;

public class ServiceService : IServiceService
{
    private readonly AppDbContext _db;

    public ServiceService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Service>> GetAllAsync()
    {
        return await _db.Services
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Service?> GetByIdAsync(Guid id)
    {
        return await _db.Services
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<Service> CreateAsync(Service service)
    {
        _db.Services.Add(service);
        await _db.SaveChangesAsync();
        return service;
    }

    public async Task<bool> UpdateAsync(Guid id, Service service)
    {
        var existing = await _db.Services
            .FirstOrDefaultAsync(x => x.Id == id);

        if (existing == null)
            return false;

        existing.Nosaukums = service.Nosaukums;
        existing.Tarifs = service.Tarifs;
        existing.Nodoklis = service.Nodoklis;
        existing.Formula = service.Formula;

        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _db.Services
            .Include(s => s.Invoices)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity == null)
            return false;

        entity.Invoices.Clear();

        _db.Services.Remove(entity);
        await _db.SaveChangesAsync();

        return true;
    }
}
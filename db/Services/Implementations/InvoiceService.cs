using db.Data;
using db.Models;
using db.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace db.Services.Implementations;

public class InvoiceService : IInvoiceService
{
    private readonly AppDbContext _db;

    public InvoiceService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Invoice>> GetAllAsync()
    {
        return await _db.Invoices
            .Include(i => i.Apartment)
            .Include(i => i.Services)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Invoice?> GetByIdAsync(Guid id)
    {
        return await _db.Invoices
            .Include(i => i.Apartment)
            .Include(i => i.Services)
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<List<Invoice>> GetMyByApartmentIdAsync(Guid userId, Guid apartmentId)
    {
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null || user.IedzivotajsId == null)
            return new List<Invoice>();

        var resident = await _db.Iedzivotaji
            .Include(r => r.Dzivokli)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == user.IedzivotajsId.Value);

        if (resident == null)
            return new List<Invoice>();

        var hasAccess = resident.Dzivokli.Any(d => d.Id == apartmentId);

        if (!hasAccess)
            return new List<Invoice>();

        return await _db.Invoices
            .Include(i => i.Apartment)
            .Include(i => i.Services)
            .Where(i => i.ApartmentId == apartmentId)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Invoice> CreateAsync(Invoice invoice)
    {
        var apartment = await _db.Dzivokli
            .Include(a => a.Maja)
            .FirstOrDefaultAsync(a => a.Id == invoice.ApartmentId);

        if (apartment == null)
            throw new Exception("Apartment not found");

        if (string.IsNullOrWhiteSpace(invoice.InvoiceIdentifier))
        {
            invoice.InvoiceIdentifier = $"H{apartment.Maja?.Numurs}-A{apartment.Numurs}-{invoice.Period}";
        }

        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync();

        return invoice;
    }

    public async Task<bool> UpdateAsync(Guid id, Invoice invoice)
    {
        var existing = await _db.Invoices.FindAsync(id);

        if (existing == null)
            return false;

        existing.InvoiceIdentifier = invoice.InvoiceIdentifier;
        existing.Period = invoice.Period;
        existing.Total = invoice.Total;
        existing.ApartmentId = invoice.ApartmentId;

        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _db.Invoices.FindAsync(id);

        if (entity == null)
            return false;

        _db.Invoices.Remove(entity);
        await _db.SaveChangesAsync();

        return true;
    }
}
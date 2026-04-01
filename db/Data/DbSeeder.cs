using db.Models;
using Microsoft.EntityFrameworkCore;

namespace db.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Majas.Any())
            return;

        /* -------------------------
           HOUSES
        ------------------------- */

        var maja1 = new Maja
        {
            Id = Guid.NewGuid(),
            Numurs = 12,
            Iela = "Brivibas iela",
            Pilseta = "Riga",
            Valsts = "Latvija",
            PastaIndekss = "LV-1010"
        };

        var maja2 = new Maja
        {
            Id = Guid.NewGuid(),
            Numurs = 7,
            Iela = "Krisjana Barona iela",
            Pilseta = "Riga",
            Valsts = "Latvija",
            PastaIndekss = "LV-1050"
        };

        db.Majas.AddRange(maja1, maja2);
        db.SaveChanges();

        /* -------------------------
           APARTMENTS
        ------------------------- */

        var d1 = new Dzivoklis
        {
            Id = Guid.NewGuid(),
            Numurs = 5,
            Stavs = 2,
            IstabuSkaits = 2,
            IedzivotajuSkaits = 2,
            PilnaPlatiba = 48.5,
            DzivojamaPlatiba = 34,
            LodzijasPlatiba = 2,
            MajaId = maja1.Id
        };

        var d2 = new Dzivoklis
        {
            Id = Guid.NewGuid(),
            Numurs = 12,
            Stavs = 5,
            IstabuSkaits = 3,
            IedzivotajuSkaits = 1,
            PilnaPlatiba = 72,
            DzivojamaPlatiba = 50,
            LodzijasPlatiba = 0,
            MajaId = maja1.Id
        };

        var d3 = new Dzivoklis
        {
            Id = Guid.NewGuid(),
            Numurs = 3,
            Stavs = 1,
            IstabuSkaits = 1,
            IedzivotajuSkaits = 1,
            PilnaPlatiba = 28,
            DzivojamaPlatiba = 18,
            LodzijasPlatiba = 1,
            MajaId = maja2.Id
        };

        var d4 = new Dzivoklis
        {
            Id = Guid.NewGuid(),
            Numurs = 8,
            Stavs = 3,
            IstabuSkaits = 2,
            IedzivotajuSkaits = 0,
            PilnaPlatiba = 55,
            DzivojamaPlatiba = 38,
            LodzijasPlatiba = 3,
            MajaId = maja2.Id
        };

        var d5 = new Dzivoklis
        {
            Id = Guid.NewGuid(),
            Numurs = 15,
            Stavs = 6,
            IstabuSkaits = 4,
            IedzivotajuSkaits = 1,
            PilnaPlatiba = 90,
            DzivojamaPlatiba = 65,
            LodzijasPlatiba = 5,
            MajaId = maja1.Id
        };

        db.Dzivokli.AddRange(d1, d2, d3, d4, d5);
        db.SaveChanges();

        /* -------------------------
           RESIDENTS
        ------------------------- */

        var i1 = new Iedzivotajs
        {
            Id = Guid.NewGuid(),
            Vards = "Anna",
            Uzvards = "Berzina",
            PersonasKods = "010101-12345",
            Telefons = "+37120000000",
            Epasts = "anna@test.lv",
            IsOwner = true
        };

        var i2 = new Iedzivotajs
        {
            Id = Guid.NewGuid(),
            Vards = "Janis",
            Uzvards = "Ozols",
            PersonasKods = "020202-54321",
            Telefons = "+37121111111",
            Epasts = "janis@test.lv",
            IsOwner = false
        };

        var i3 = new Iedzivotajs
        {
            Id = Guid.NewGuid(),
            Vards = "Elina",
            Uzvards = "Kalnina",
            PersonasKods = "030303-11111",
            Telefons = "+37122222222",
            Epasts = "elina@test.lv",
            IsOwner = true
        };

        var i4 = new Iedzivotajs
        {
            Id = Guid.NewGuid(),
            Vards = "Markus",
            Uzvards = "Liepa",
            PersonasKods = "040404-22222",
            Telefons = "+37123333333",
            Epasts = "markus@test.lv",
            IsOwner = false
        };

        i1.Dzivokli.Add(d1);
        i1.Dzivokli.Add(d2);
        i2.Dzivokli.Add(d1);
        i3.Dzivokli.Add(d3);
        i4.Dzivokli.Add(d5);

        db.Iedzivotaji.AddRange(i1, i2, i3, i4);
        db.SaveChanges();

        /* -------------------------
           SERVICES
        ------------------------- */

        var s1 = new Service
        {
            Id = Guid.NewGuid(),
            Nosaukums = "Apkure",
            Tarifs = 0.20m,
            Nodoklis = 21,
            Formula = "area * tariff"
        };

        var s2 = new Service
        {
            Id = Guid.NewGuid(),
            Nosaukums = "Udens",
            Tarifs = 1.50m,
            Nodoklis = 21,
            Formula = "usage * tariff"
        };

        var s3 = new Service
        {
            Id = Guid.NewGuid(),
            Nosaukums = "Elektriba",
            Tarifs = 0.15m,
            Nodoklis = 21,
            Formula = "usage * tariff"
        };

        var s4 = new Service
        {
            Id = Guid.NewGuid(),
            Nosaukums = "Atkritumi",
            Tarifs = 3.00m,
            Nodoklis = 21,
            Formula = "residents * tariff"
        };

        var s5 = new Service
        {
            Id = Guid.NewGuid(),
            Nosaukums = "Apsaimniekosana",
            Tarifs = 0.10m,
            Nodoklis = 21,
            Formula = "maintenance"
        };

        db.Services.AddRange(s1, s2, s3, s4, s5);
        db.SaveChanges();

        /* -------------------------
           LEASEHOLDS
           Можно оставить, если ещё используются в других частях проекта
        ------------------------- */

        var l1 = new Leasehold { Id = Guid.NewGuid(), ApartmentId = d1.Id, MajaId = maja1.Id };
        var l2 = new Leasehold { Id = Guid.NewGuid(), ApartmentId = d2.Id, MajaId = maja1.Id };
        var l3 = new Leasehold { Id = Guid.NewGuid(), ApartmentId = d3.Id, MajaId = maja2.Id };
        var l4 = new Leasehold { Id = Guid.NewGuid(), ApartmentId = d4.Id, MajaId = maja2.Id };
        var l5 = new Leasehold { Id = Guid.NewGuid(), ApartmentId = d5.Id, MajaId = maja1.Id };

        db.Leaseholds.AddRange(l1, l2, l3, l4, l5);
        db.SaveChanges();

        /* -------------------------
           INVOICES
           Лучше не сидить, а генерировать через UI
        ------------------------- */

        /*
        db.Invoices.AddRange(

            new Invoice
            {
                Id = Guid.NewGuid(),
                InvoiceIdentifier = $"{maja1.Numurs}-{d1.Numurs}",
                Period = "2025-03",
                Total = 120,
                ApartmentId = d1.Id
            },

            new Invoice
            {
                Id = Guid.NewGuid(),
                InvoiceIdentifier = $"{maja1.Numurs}-{d2.Numurs}",
                Period = "2025-03",
                Total = 95,
                ApartmentId = d2.Id
            },

            new Invoice
            {
                Id = Guid.NewGuid(),
                InvoiceIdentifier = $"{maja2.Numurs}-{d3.Numurs}",
                Period = "2025-03",
                Total = 60,
                ApartmentId = d3.Id
            }

        );

        db.SaveChanges();
        */

        /* -------------------------
           USERS
        ------------------------- */

        db.Users.AddRange(

            new User
            {
                Id = Guid.NewGuid(),
                Email = "manager@test.com",
                Password = "123",
                Role = "Manager"
            },

            new User
            {
                Id = Guid.NewGuid(),
                Email = "resident@test.com",
                Password = "123",
                Role = "Resident"
            }

        );

        db.SaveChanges();
    }
}
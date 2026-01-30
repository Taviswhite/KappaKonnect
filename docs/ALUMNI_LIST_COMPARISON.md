# Alumni List Comparison: Your List vs. Database Migrations

Compared your canonical line list to what is **inserted by migrations** (add_xi_chapter_alumni, ensure_alumni_lines_fall_2023_to_spring_2016, ensure_spring_2022_line_4_and_9, seed_all_alumni_lines).  
**Note:** Spring 2025 and Spring 2024 are only added by `seed_demo_data.sql` when auth users exist; they are not in the “standalone” line-insert migrations.

---

## Who we DON'T have (missing from standalone migrations)

### 1. **SPRING 2025** — entire line not in standalone migrations

These 14 initiates are only created in `seed_demo_data.sql` (when auth users exist). There is **no** migration that INSERTs Spring 2025 into `alumni` like the other lines.

| # | Name |
|---|------|
| 1 | Jerimiah Ramirez |
| 2 | Doole Gaiende Edwards |
| 3 | Grant Hill |
| 4 | Andre Sawyerr |
| 5 | Jordan Atkins |
| 6 | Mael Blunt |
| 7 | Malachi MacMillan |
| 8 | Amir Stevenson |
| 9 | Reginald Alexander |
| 10 | Don Jordan (Duplan) |
| 11 | Dylan Darling |
| 12 | Jared Baker |
| 13 | Carsen Manuel |
| 14 | Kaden Cobb |

Plus roles: Dean (Joseph Serra 8-Xi-24), ADP (Lloyd Maxwell 8-Xi-22), Staff (Brandon McCaskill 15-Xi-24, Ahmad Edwards 6-Xi-24) — these are cross-references to other lines, not extra people.

---

### 2. **SPRING 2024** — entire line not in standalone migrations

Same situation: the 18 Spring 2024 initiates are only added in `seed_demo_data.sql` when auth users exist. No standalone migration INSERTs Spring 2024 into `alumni`.

| # | Name |
|---|------|
| 1 | Bryce Perkins |
| 2 | Ahmod Newton |
| 3 | Bryan Singleton II |
| 4 | Kobe Denmark-Garnett |
| 5 | Skylar Peterkin |
| 6 | Ahmad Edwards |
| 7 | Gregory Allen Jr. |
| 8 | Joseph Serra |
| 9 | Khimarhi Testamark |
| 10 | Keith Henderson Jr. |
| 11 | Joshua Carter |
| 12 | Chase Knox |
| 13 | Daniel Miller |
| 14 | Bryce Facey |
| 15 | Marshall Williams |
| 16 | Brandon McCaskill |
| 17 | Mory Diakite |
| 18 | Jordan Newsome |

Plus Dean (ronrva), ADP (Santana Wolfe).

---

### 3. **SPRING 2001** — position 7 (Chapter Invisible)

| # | Name | In DB? |
|---|------|--------|
| 7 | R.I.P Gerard James III – Chapter Invisible | **No** – we only insert 6 (Keith Stone through Mark Smith). Position 7 is intentionally omitted. |

---

### 4. **SPRING 2009** — position 4 name difference

| # | Your list | In ensure_alumni_lines |
|---|-----------|-------------------------|
| 4 | Alix Martin – Kommodity | **Robert Spears** (we have Robert at 4, Jason Cole at 5) |
| 5 | Robert Spears – Kasanova | We have Jason Cole at 5 |

So we are **missing Alix Martin** in the main ensure migration; `seed_all_alumni_lines.sql` has Alix Martin at 4 and Robert Spears at 5, but `ensure_alumni_lines_fall_2023_to_spring_2016.sql` has only Robert at 4 and no Alix.

---

## Who we DO have (all other lines)

- **SPRING 2022** – all 12 (including 4 & 9 from ensure_spring_2022_line_4_and_9).
- **FALL 2023** – all 3.
- **SPRING 2017** – all 8 (Quodarrious Toney / Quodarious Tony – spelling varies).
- **SPRING 2016** – 11 (we omit “Does Not Exist” at 11).
- **SPRING 2014** – all 12.
- **SPRING 2013** – all 16.
- **SPRING 2012** – all 13.
- **SPRING 2010** – all 12.
- **SPRING 2009** – 15 names, but position 4 is Robert Spears (not Alix Martin) in ensure migration.
- **SPRING 2007** – all 7 (Presley Nelson Jr. / Presly – we use Presley).
- **SPRING 2001** – 6 (no Gerard James III).
- **SPRING 1998** – 13 (we have DNE slot as position 3 in your list; we use Lakeem Dwight at 3).
- **SPRING 1993** – 9 (we skip position 5 / R.I.P Emmett Richardson).
- **SPRING 1992** – 20 (we skip position 3 / DNE).
- **SPRING 1986** – all 15.
- **SPRING 1985** – all 13.

---

## Summary

| Line | Status |
|------|--------|
| **SPRING 2025** | Not in standalone migrations; only in seed_demo_data (auth-dependent). |
| **SPRING 2024** | Not in standalone migrations; only in seed_demo_data (auth-dependent). |
| **SPRING 2001 #7** | Gerard James III (Chapter Invisible) – not inserted. |
| **SPRING 2009 #4** | We have Robert Spears; your list has Alix Martin at 4 – **Alix Martin missing** in ensure_alumni_lines. |

To have Spring 2025 and Spring 2024 in the alumni portal without relying on seed_demo_data, add a migration that INSERTs those lines into `public.alumni` (like ensure_spring_2022_line_4_and_9 or the blocks in ensure_alumni_lines_fall_2023_to_spring_2016).

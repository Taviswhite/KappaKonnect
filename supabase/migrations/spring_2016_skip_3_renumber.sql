-- Spring 2016: skip 3-Xi-16, Walter = 4-Xi-16, rest shift, R. Solomon = 12-Xi-16
-- 1, 2, (no 3), 4 Walter, 5 Cody, 6 Skyler, 7 Allen, 8 Brandon, 9 Amir, 10 Matthew, 11 Johnathan, 12 R. Solomon

UPDATE public.alumni SET line_order = 4
WHERE line_label = 'SPRING 2016' AND (full_name = 'Walter Peacock III' OR full_name ILIKE 'Walter Peacock%');

UPDATE public.alumni SET line_order = 5
WHERE line_label = 'SPRING 2016' AND (full_name = 'Cody Williams jr' OR full_name ILIKE 'Cody Williams%');

UPDATE public.alumni SET line_order = 6
WHERE line_label = 'SPRING 2016' AND (full_name = 'Skyler Lemons' OR full_name ILIKE 'Skyler Lemons%');

UPDATE public.alumni SET line_order = 7
WHERE line_label = 'SPRING 2016' AND (full_name = 'Allen Royal III' OR full_name ILIKE 'Allen Royal%');

UPDATE public.alumni SET line_order = 8
WHERE line_label = 'SPRING 2016' AND (full_name = 'Brandon McClary' OR full_name ILIKE 'Brandon McClary%');

UPDATE public.alumni SET line_order = 9
WHERE line_label = 'SPRING 2016' AND (full_name = 'Amir Edgerton' OR full_name ILIKE 'Amir Edgerton%');

UPDATE public.alumni SET line_order = 10
WHERE line_label = 'SPRING 2016' AND (full_name = 'Matthew Walker' OR full_name ILIKE 'Matthew Walker%');

UPDATE public.alumni SET line_order = 11
WHERE line_label = 'SPRING 2016' AND (full_name = 'Johnathan Joseph' OR full_name ILIKE 'Johnathan Joseph%');

UPDATE public.alumni SET line_order = 12
WHERE line_label = 'SPRING 2016' AND (full_name = 'R. Solomon Mangham' OR full_name ILIKE 'R. Solomon Mangham%' OR full_name ILIKE 'R.Solomon%');

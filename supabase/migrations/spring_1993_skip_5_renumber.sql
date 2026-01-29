-- Spring 1993: skip 5-Xi-93, Tyrone = 6-Xi-93, rest shift (Jesse Walton 7, Jesse Fenty 8, Sean Turley 9)
-- 1, 2, 3, 4, (no 5), 6 Tyrone, 7 Jesse Walton Jr., 8 Jesse Fenty, 9 Sean Turley

UPDATE public.alumni SET line_order = 6
WHERE line_label = 'SPRING 1993' AND (full_name = 'Tyrone Mitchell' OR full_name ILIKE 'Tyrone Mitchell%');

UPDATE public.alumni SET line_order = 7
WHERE line_label = 'SPRING 1993' AND (full_name = 'Jesse Walton Jr.' OR full_name ILIKE 'Jesse Walton%');

UPDATE public.alumni SET line_order = 8
WHERE line_label = 'SPRING 1993' AND (full_name = 'Jesse Fenty' OR full_name ILIKE 'Jesse Fenty%');

UPDATE public.alumni SET line_order = 9
WHERE line_label = 'SPRING 1993' AND (full_name = 'Sean Turley' OR full_name ILIKE 'Sean Turley%');

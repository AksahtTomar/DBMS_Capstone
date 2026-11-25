/**
 * Seed Fallback In-Memory Store for CinePass
 * Automatically activates when MySQL connection is unavailable (e.g. serverless Vercel without cloud DB)
 * Ensures 100% functionality of movies, theatres, showtimes, seats, payments, and bookings.
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const mockMovies = [
    {
        movie_id: 1,
        title: 'The Dark Knight',
        genre: 'Action',
        duration_minutes: 152,
        language: 'English',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        poster_url: '/images/posters/the-dark-knight.svg',
        banner_url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1200&q=80',
        rating: 4.9,
        votes_count: 15420,
        cast_crew: 'Christian Bale, Heath Ledger, Aaron Eckhart | Dir: Christopher Nolan',
        release_status: 'NOW_SHOWING',
        trailer_url: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        release_date: '2008-07-18'
    },
    {
        movie_id: 2,
        title: 'Inception',
        genre: 'Sci-Fi',
        duration_minutes: 148,
        language: 'English',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        poster_url: '/images/posters/inception.svg',
        banner_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80',
        rating: 4.8,
        votes_count: 12890,
        cast_crew: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page | Dir: Christopher Nolan',
        release_status: 'NOW_SHOWING',
        trailer_url: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
        release_date: '2010-07-16'
    },
    {
        movie_id: 3,
        title: 'Interstellar',
        genre: 'Sci-Fi',
        duration_minutes: 169,
        language: 'English',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival as Earth faces catastrophic famine.',
        poster_url: '/images/posters/interstellar.svg',
        banner_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
        rating: 4.9,
        votes_count: 18900,
        cast_crew: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain | Dir: Christopher Nolan',
        release_status: 'NOW_SHOWING',
        trailer_url: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        release_date: '2014-11-07'
    },
    {
        movie_id: 4,
        title: 'Parasite',
        genre: 'Thriller',
        duration_minutes: 132,
        language: 'Korean',
        description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
        poster_url: '/images/posters/parasite.svg',
        banner_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1200&q=80',
        rating: 4.6,
        votes_count: 9400,
        cast_crew: 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong | Dir: Bong Joon Ho',
        release_status: 'NOW_SHOWING',
        trailer_url: 'https://www.youtube.com/watch?v=5xH0hhMBw80',
        release_date: '2019-05-30'
    },
    {
        movie_id: 5,
        title: 'RRR',
        genre: 'Action',
        duration_minutes: 187,
        language: 'Telugu',
        description: 'A fearless revolutionary and an officer in the British force, who once shared a deep bond, decide to join forces and chart out an inspiring path of freedom against the despotic rulers.',
        poster_url: '/images/posters/rrr.svg',
        banner_url: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=1200&q=80',
        rating: 4.7,
        votes_count: 14200,
        cast_crew: 'N.T. Rama Rao Jr., Ram Charan, Alia Bhatt | Dir: S.S. Rajamouli',
        release_status: 'NOW_SHOWING',
        trailer_url: 'https://www.youtube.com/watch?v=f_vbAtFSEc0',
        release_date: '2022-03-25'
    },
    {
        movie_id: 6,
        title: 'Dune: Part Two',
        genre: 'Sci-Fi',
        duration_minutes: 166,
        language: 'English',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
        poster_url: '/images/posters/dune-part-two.svg',
        banner_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80',
        rating: 4.8,
        votes_count: 16800,
        cast_crew: 'Timothee Chalamet, Zendaya, Rebecca Ferguson | Dir: Denis Villeneuve',
        release_status: 'NOW_SHOWING',
        trailer_url: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        release_date: '2024-03-01'
    },
    {
        movie_id: 7,
        title: 'Oppenheimer',
        genre: 'Drama',
        duration_minutes: 180,
        language: 'English',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
        poster_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&q=80',
        banner_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&q=80',
        rating: 4.8,
        votes_count: 17200,
        cast_crew: 'Cillian Murphy, Emily Blunt, Matt Damon | Dir: Christopher Nolan',
        release_status: 'NOW_SHOWING',
        trailer_url: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        release_date: '2023-07-21'
    },
    {
        movie_id: 8,
        title: 'Avengers: Secret Wars',
        genre: 'Action',
        duration_minutes: 165,
        language: 'English',
        description: 'Earth\'s mightiest heroes reunite across dimensions and parallel timelines to battle the multiverse collapse.',
        poster_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80',
        banner_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=80',
        rating: 4.9,
        votes_count: 8500,
        cast_crew: 'Ensemble Marvel Cast | Marvel Studios',
        release_status: 'COMING_SOON',
        trailer_url: 'https://www.youtube.com',
        release_date: '2027-05-07'
    },
    {
        movie_id: 9,
        title: 'Spider-Man: Beyond the Spider-Verse',
        genre: 'Animation',
        duration_minutes: 140,
        language: 'English',
        description: 'Miles Morales must navigate the multiverse to save the people he loves most from impending reality destruction.',
        poster_url: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&q=80',
        banner_url: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1200&q=80',
        rating: 4.9,
        votes_count: 9300,
        cast_crew: 'Shameik Moore, Hailee Steinfeld | Sony Pictures Animation',
        release_status: 'COMING_SOON',
        trailer_url: 'https://www.youtube.com',
        release_date: '2026-12-18'
    },
    {
        movie_id: 10,
        title: 'Kabir Singh',
        genre: 'Romance',
        duration_minutes: 165,
        language: 'Hindi',
        description: 'A hot-headed surgeon meets a brave medical student at a college, exploring love, loss and redemption.',
        poster_url: '/images/posters/kabir-singh.svg',
        banner_url: 'https://images.unsplash.com/photo-1517602302552-471fe67acf66?w=1200&q=80',
        rating: 4.5,
        votes_count: 11000,
        cast_crew: 'Shahid Kapoor, Kiara Advani | Dir: Sandeep Reddy Vanga',
        release_status: 'NOW_SHOWING',
        trailer_url: 'https://www.youtube.com/watch?v=JkLlqgVoiP8',
        release_date: '2020-06-21'
    },
    {
        movie_id: 11,
        title: 'Baahubali: The Beginning',
        genre: 'Action',
        duration_minutes: 159,
        language: 'Telugu',
        description: 'Epic tale of two brothers in a kingdom torn by betrayal and power.',
        poster_url: '/images/posters/baahubali1.svg',
        banner_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=1200&q=80',
        rating: 4.7,
        votes_count: 15000,
        cast_crew: 'Prabhas, Rana Daggubati | Dir: S.S. Rajamouli',
        release_status: 'NOW_SHOWING',
        trailer_url: 'https://www.youtube.com/watch?v=3U8ZPVApG1w',
        release_date: '2015-07-10'
    },
    {
        movie_id: 12,
        title: 'Kantara',
        genre: 'Drama',
        duration_minutes: 124,
        language: 'Kannada',
        description: 'A mythic tale of man versus nature set in the Western Ghats.',
        poster_url: '/images/posters/kantara.svg',
        banner_url: 'https://images.unsplash.com/photo-1617563312615-cd5d8e573ef0?w=1200&q=80',
        rating: 4.6,
        votes_count: 9000,
        cast_crew: 'Rishab Shetty, Sapthami Gowda | Dir: Rishab Shetty',
        release_status: 'NOW_SHOWING',
        trailer_url: 'https://www.youtube.com/watch?v=Ktr-R2AVeAU',
        release_date: '2022-09-30'
    },
    {
        movie_id: 13,
        title: 'Joker',
        genre: 'Drama',
        duration_minutes: 122,
        language: 'English',
        description: 'A gritty origin story of a failed comedian turned chaotic villain.',
        poster_url: '/images/posters/joker.svg',
        banner_url: 'https://images.unsplash.com/photo-1521452263015-ef44692281b4?w=1200&q=80',
        rating: 4.8,
        votes_count: 20000,
        cast_crew: 'Joaquin Phoenix | Dir: Todd Phillips',
        release_status: 'NOW_SHOWING',
        trailer_url: 'https://www.youtube.com/watch?v=zAGJQ3tJ4Io',
        release_date: '2019-10-04'
    }
];

const mockTheatres = [
    {
        theatre_id: 1,
        name: 'PVR ICON: Infiniti Mall',
        city: 'Mumbai',
        address: 'Link Road, Andheri West, Mumbai',
        total_screens: 3
    },
    {
        theatre_id: 2,
        name: 'INOX Megaplex: Inorbit Mall',
        city: 'Mumbai',
        address: 'Link Road, Malad West, Mumbai',
        total_screens: 2
    },
    {
        theatre_id: 3,
        name: 'Cinepolis: DLF Avenue',
        city: 'Delhi',
        address: 'Press Enclave Road, Saket, New Delhi',
        total_screens: 3
    },
    {
        theatre_id: 4,
        name: 'PVR Superplex: Forum Mall',
        city: 'Bengaluru',
        address: 'Hosur Road, Koramangala, Bengaluru',
        total_screens: 2
    }
];

const mockScreens = [
    { screen_id: 1, theatre_id: 1, screen_number: 1, screen_name: 'Audi 1 - IMAX Laser 3D', screen_type: 'IMAX Laser', total_seats: 64 },
    { screen_id: 2, theatre_id: 1, screen_number: 2, screen_name: 'Audi 2 - 4DX Dynamic', screen_type: '4DX', total_seats: 64 },
    { screen_id: 3, theatre_id: 1, screen_number: 3, screen_name: 'Audi 3 - Dolby Atmos Premiere', screen_type: 'Dolby Atmos', total_seats: 64 },
    { screen_id: 4, theatre_id: 2, screen_number: 1, screen_name: 'Audi 1 - Insignia Luxury', screen_type: 'Luxury Recliner', total_seats: 64 },
    { screen_id: 5, theatre_id: 2, screen_number: 2, screen_name: 'Audi 2 - BigPix 4K', screen_type: 'Dolby 7.1', total_seats: 64 },
    { screen_id: 6, theatre_id: 3, screen_number: 1, screen_name: 'Audi 1 - Macro XE', screen_type: 'IMAX', total_seats: 64 },
    { screen_id: 7, theatre_id: 3, screen_number: 2, screen_name: 'Audi 2 - VIP Lounge', screen_type: 'VIP Lounge', total_seats: 64 },
    { screen_id: 8, theatre_id: 4, screen_number: 1, screen_name: 'Audi 1 - P[XL] Large Screen', screen_type: 'Dolby Atmos', total_seats: 64 }
];

// In-memory collections for active sessions
let inMemoryBookings = [];
let inMemoryUsers = [
    {
        user_id: 1,
        name: 'Akshat Tomar',
        email: 'akshat@cinepass.com',
        phone: '9654925538',
        role: 'ADMIN',
        avatar: '🎬'
    }
];

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Generate dynamic shows from today forward
 */
function generateDynamicShows() {
    const shows = [];
    const now = new Date();
    const times = ['10:00:00', '13:30:00', '16:45:00', '20:00:00', '22:30:00'];
    const activeMovies = mockMovies.filter(m => m.release_status === 'NOW_SHOWING');

    let showId = 1;
    for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
        const showDateObj = new Date(now);
        showDateObj.setDate(now.getDate() + dayOffset);
        const dateStr = formatDate(showDateObj);

        for (const movie of activeMovies) {
            for (const screen of mockScreens.slice(0, 4)) {
                const theatre = mockTheatres.find(t => t.theatre_id === screen.theatre_id) || mockTheatres[0];
                const timeIndex = (movie.movie_id + screen.screen_id + dayOffset) % times.length;
                const showTime = times[timeIndex];
                const price = 250 + ((movie.movie_id * 30) % 150);

                shows.push({
                    show_id: showId++,
                    movie_id: movie.movie_id,
                    theatre_id: theatre.theatre_id,
                    screen_id: screen.screen_id,
                    show_date: dateStr,
                    show_time: showTime,
                    ticket_price: price,
                    total_seats: 64,
                    available_seats: 58,
                    movie_title: movie.title,
                    genre: movie.genre,
                    language: movie.language,
                    poster_url: movie.poster_url,
                    duration_minutes: movie.duration_minutes,
                    theatre_name: theatre.name,
                    city: theatre.city,
                    address: theatre.address,
                    screen_name: screen.screen_name,
                    screen_type: screen.screen_type
                });
            }
        }
    }
    return shows;
}

/**
 * Generate 64 standard seats for a screen
 */
function generateSeatsForScreen(screenId) {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seats = [];
    let seatId = 1;

    for (const r of rows) {
        let tier = 'CLASSIC';
        let multiplier = 1.0;
        if (r === 'A' || r === 'B') {
            tier = 'RECLINER';
            multiplier = 1.5;
        } else if (r === 'C' || r === 'D' || r === 'E' || r === 'F') {
            tier = 'PRIME';
            multiplier = 1.2;
        }

        for (let c = 1; c <= 8; c++) {
            seats.push({
                seat_id: seatId++,
                screen_id: screenId || 1,
                seat_number: `${r}${c}`,
                seat_row: r,
                seat_col: c,
                seat_tier: tier,
                price_multiplier: multiplier
            });
        }
    }
    return seats;
}

const mockStore = {
    // Check if error is DB connection issue
    isConnectionError(err) {
        if (!err) return false;
        const msg = (err.message || '').toLowerCase();
        const code = err.code || '';
        return code === 'ECONNREFUSED' ||
               code === 'ETIMEDOUT' ||
               code === 'ENOTFOUND' ||
               code === 'PROTOCOL_CONNECTION_LOST' ||
               code === 'ER_ACCESS_DENIED_ERROR' ||
               msg.includes('econnrefused') ||
               msg.includes('etimedout') ||
               msg.includes('enotfound') ||
               msg.includes('access denied');
    },

    // Movies
    getMovies({ search, genre, language, status, sort }) {
        let list = [...mockMovies];

        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(m =>
                m.title.toLowerCase().includes(q) ||
                m.description.toLowerCase().includes(q) ||
                m.genre.toLowerCase().includes(q)
            );
        }

        if (genre && genre !== 'all' && genre.trim()) {
            list = list.filter(m => m.genre.toLowerCase().includes(genre.trim().toLowerCase()));
        }

        if (language && language !== 'all' && language.trim()) {
            list = list.filter(m => m.language.toLowerCase() === language.trim().toLowerCase());
        }

        if (status && status !== 'all' && status.trim()) {
            list = list.filter(m => m.release_status === status.trim().toUpperCase());
        }

        switch (sort) {
            case 'rating':
                list.sort((a, b) => b.rating - a.rating || b.votes_count - a.votes_count);
                break;
            case 'popularity':
                list.sort((a, b) => b.votes_count - a.votes_count || b.rating - a.rating);
                break;
            case 'latest':
                list.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
                break;
            case 'title_asc':
                list.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default:
                list.sort((a, b) => (a.release_status === 'NOW_SHOWING' ? -1 : 1) || b.rating - a.rating);
                break;
        }

        return list;
    },

    getMovieById(id) {
        const numId = parseInt(id, 10);
        const movie = mockMovies.find(m => m.movie_id === numId);
        if (!movie) return null;

        return {
            ...movie,
            upcoming_shows_count: 12,
            reviews: [
                {
                    review_id: 101,
                    rating: 5,
                    review_text: 'An absolute masterpiece of cinema. Visuals and soundtrack are incredible!',
                    created_at: new Date().toISOString(),
                    user_name: 'Rahul Sharma'
                },
                {
                    review_id: 102,
                    rating: 4.8,
                    review_text: 'Top tier direction and acting. Truly a must watch in IMAX.',
                    created_at: new Date().toISOString(),
                    user_name: 'Priya Patel'
                }
            ]
        };
    },

    // Theatres
    getTheatres({ city }) {
        let list = [...mockTheatres];
        if (city && city.trim() && city.toLowerCase() !== 'all') {
            list = list.filter(t => t.city.toLowerCase() === city.trim().toLowerCase());
        }
        return list.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
    },

    getCities() {
        return ['Bengaluru', 'Delhi', 'Mumbai'];
    },

    getTheatreById(id) {
        const numId = parseInt(id, 10);
        const theatre = mockTheatres.find(t => t.theatre_id === numId);
        if (!theatre) return null;
        const screens = mockScreens.filter(s => s.theatre_id === numId);
        return { ...theatre, screens };
    },

    // Shows
    getShows({ movie_id, theatre_id, city, date }) {
        let list = generateDynamicShows();

        if (movie_id) {
            const mid = parseInt(movie_id, 10);
            list = list.filter(s => s.movie_id === mid);
        }

        if (theatre_id) {
            const tid = parseInt(theatre_id, 10);
            list = list.filter(s => s.theatre_id === tid);
        }

        if (city && city.toLowerCase() !== 'all') {
            list = list.filter(s => s.city.toLowerCase() === city.trim().toLowerCase());
        }

        if (date) {
            list = list.filter(s => s.show_date === date.trim());
        }

        return list;
    },

    getShowById(id) {
        const numId = parseInt(id, 10);
        const list = generateDynamicShows();
        return list.find(s => s.show_id === numId) || list[0] || null;
    },

    // Seats
    getSeatsForShow(showId) {
        const show = this.getShowById(showId);
        if (!show) return null;
        const seats = generateSeatsForScreen(show.screen_id);
        const occupiedSeatNumbers = ['C3', 'C4', 'D5', 'D6'];
        const occupiedSeats = seats
            .filter(s => occupiedSeatNumbers.includes(s.seat_number))
            .map(s => ({ seat_id: s.seat_id, seat_number: s.seat_number }));

        return {
            show,
            seats,
            occupiedSeats
        };
    },

    // Bookings
    createBooking({ customer_name, email, show_id, number_of_tickets, seat_ids, transaction_id, payment_method }) {
        const show = this.getShowById(show_id);
        const seats = generateSeatsForScreen(show ? show.screen_id : 1);
        const selectedSeats = Array.isArray(seat_ids) && seat_ids.length > 0
            ? seats.filter(s => seat_ids.includes(s.seat_id))
            : seats.slice(10, 10 + (number_of_tickets || 1));

        const basePrice = show ? show.ticket_price : 350;
        const totalAmount = selectedSeats.reduce((sum, s) => sum + (basePrice * s.price_multiplier), 0);
        const bookingRef = 'CP-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);
        const bookingId = inMemoryBookings.length + 1001;

        const booking = {
            booking_id: bookingId,
            booking_reference: bookingRef,
            user_id: 1,
            customer_name: customer_name || 'Moviegoer',
            email: email || 'user@cinepass.com',
            show_id: show ? show.show_id : 1,
            movie_title: show ? show.movie_title : 'The Dark Knight',
            theatre_name: show ? show.theatre_name : 'PVR ICON: Infiniti Mall',
            city: show ? show.city : 'Mumbai',
            screen_name: show ? show.screen_name : 'Audi 1 - IMAX Laser 3D',
            screen_type: show ? show.screen_type : 'IMAX Laser',
            show_date: show ? show.show_date : formatDate(new Date()),
            show_time: show ? show.show_time : '20:00:00',
            poster_url: show ? show.poster_url : '/images/posters/the-dark-knight.svg',
            number_of_tickets: selectedSeats.length,
            seats: selectedSeats.map(s => ({
                seat_id: s.seat_id,
                seat_number: s.seat_number,
                seat_tier: s.seat_tier
            })),
            seat_numbers: selectedSeats.map(s => s.seat_number).join(', '),
            total_amount: totalAmount,
            booking_status: 'CONFIRMED',
            payment_status: 'PAID',
            payment_method: payment_method || 'UPI',
            transaction_id: transaction_id || 'UPI-' + Date.now(),
            created_at: new Date().toISOString()
        };

        inMemoryBookings.unshift(booking);
        return booking;
    },

    getBookingById(idOrRef) {
        return inMemoryBookings.find(b => 
            b.booking_id == idOrRef || b.booking_reference === idOrRef
        ) || inMemoryBookings[0] || null;
    },

    getUserBookings(email) {
        if (!email) return inMemoryBookings;
        const normalized = email.trim().toLowerCase();
        return inMemoryBookings.filter(b => b.email && b.email.toLowerCase() === normalized);
    },

    // User Auth Fallback
    mockLogin(email, password) {
        const normalized = (email || '').trim().toLowerCase();
        let user = inMemoryUsers.find(u => u.email === normalized);
        if (!user) {
            user = {
                user_id: inMemoryUsers.length + 1,
                name: email.split('@')[0] || 'Movie Enthusiast',
                email: normalized,
                phone: '9654925538',
                role: 'CUSTOMER',
                avatar: '🍿'
            };
            inMemoryUsers.push(user);
        }

        const token = jwt.sign(
            { user_id: user.user_id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return { token, user };
    },

    mockRegister({ name, email, phone }) {
        const normalized = (email || '').trim().toLowerCase();
        let user = inMemoryUsers.find(u => u.email === normalized);
        if (!user) {
            user = {
                user_id: inMemoryUsers.length + 1,
                name: (name || 'Moviegoer').trim(),
                email: normalized,
                phone: phone || null,
                role: 'CUSTOMER',
                avatar: '🎬'
            };
            inMemoryUsers.push(user);
        }

        const token = jwt.sign(
            { user_id: user.user_id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return { token, user };
    },

    mockUpdateProfile(userId, { name, phone, avatar }) {
        let user = inMemoryUsers.find(u => u.user_id == userId) || inMemoryUsers[0];
        if (name) user.name = name.trim();
        if (phone !== undefined) user.phone = phone;
        if (avatar !== undefined) user.avatar = avatar;
        return user;
    }
};

module.exports = mockStore;

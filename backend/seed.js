const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Song = require("./src/models/song.model");

// Load environment variables
dotenv.config();

const songs = [
    {
        title: "Jeena Jeena",
        artist: "Atif Aslam",
        album: "Badlapur",
        duration: 229,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        coverImage: "https://images.unsplash.com/photo-1500099817043-86d46000d58f?w=500&q=80"
    },
    {
        title: "Pal",
        artist: "Arijit Singh",
        album: "Jalebi",
        duration: 247,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        coverImage: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=500&q=80"
    },
    {
        title: "Nazar Na Lag Jaye",
        artist: "Ash King",
        album: "Stree",
        duration: 206,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
        coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80"
    },
    {
        title: "Thodi Der",
        artist: "Farhan Saeed & Shreya Ghoshal",
        album: "Half Girlfriend",
        duration: 296,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
        coverImage: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=500&q=80"
    },
    {
        title: "Tum Hi Ho",
        artist: "Arijit Singh",
        album: "Aashiqui 2",
        duration: 262,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
        coverImage: "https://images.unsplash.com/photo-1537944434965-cf4679d1a598?w=500&q=80"
    },
    {
        title: "Channa Mereya",
        artist: "Arijit Singh",
        album: "Ae Dil Hai Mushkil",
        duration: 289,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
        coverImage: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=500&q=80"
    },
    {
        title: "Helix Symphony No. 1",
        artist: "SoundHelix",
        album: "Helix Vol. 1",
        duration: 372,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80"
    },
    {
        title: "Helix Symphony No. 2",
        artist: "SoundHelix",
        album: "Helix Vol. 1",
        duration: 423,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80"
    },
    {
        title: "Helix Symphony No. 3",
        artist: "SoundHelix",
        album: "Helix Vol. 2",
        duration: 302,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80"
    },
    {
        title: "Helix Symphony No. 4",
        artist: "SoundHelix",
        album: "Helix Vol. 2",
        duration: 502,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        coverImage: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80"
    }
];

const seedDB = async () => {
    try {
        console.log("Connecting to Database to seed songs...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database Connected successfully.");

        // Clear existing songs
        console.log("Clearing existing songs...");
        await Song.deleteMany({});
        console.log("Existing songs deleted.");

        // Seed new songs
        console.log("Inserting new tracks...");
        const seededSongs = await Song.insertMany(songs);
        console.log(`Successfully seeded ${seededSongs.length} songs!`);

        // Log the IDs and names of seeded songs for reference
        seededSongs.forEach(song => {
            console.log(`- [${song._id}] ${song.title} by ${song.artist}`);
        });

        // Close connection
        await mongoose.connection.close();
        console.log("Database connection closed. Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDB();

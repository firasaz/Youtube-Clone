import { db } from "@/db";
import { videoCategories } from "@/db/schema";

const categoryNames = [
  "Cars and vehicles",
  "Comedy",
  "Education",
  "Gaming",
  "Entertainment",
  "Film and animation",
  "How-to and style",
  "Music",
  "News and politics",
  "People and blogs",
  "Pets and animals",
  "Science and technology",
  "Sports",
  "Travel and events",
];

const main = async () => {
  console.log("seeding categories...");

  try {
    const values = categoryNames.map((name) => ({
      name,
      description: `Videos related to ${name.toLowerCase()}`,
    }));

    await db.insert(videoCategories).values(values);
    console.log("Categories seeded successfully!");
  } catch (err) {
    console.error("Error seeding categories:", err);
    process.exit(1);
  }
};

main();

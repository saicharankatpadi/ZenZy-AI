import Image from "next/image";
import { cn, getTechLogos } from "@/lib/utils";

const DisplayTechIcons = async ({ techStack }) => {
  const techIcons = await getTechLogos(techStack);

  return (
    <div className="flex flex-row">
      {techIcons.slice(0, 3).map(({ tech, url }, index) => (
        <div
          key={tech}
          className={cn(
            "relative group bg-gray-100 rounded-full p-2 flex items-center justify-center border border-gray-200",
            index >= 1 && "-ml-3"
          )}
        >
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {tech}
          </span>

          <Image
            src={url}
            alt={tech}
            width={100}
            height={100}
            className="w-5 h-5 object-contain"
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayTechIcons;
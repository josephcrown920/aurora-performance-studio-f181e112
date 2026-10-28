import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import portrait from "@/assets/nba-josh/portrait.jpg.asset.json";
import character from "@/assets/nba-josh/full-body.jpg.asset.json";
import performance from "@/assets/nba-josh/performance-violet.jpg";

export function FeaturedArtist() {
  return <section aria-label="Featured artist" className="relative z-10 border-t border-border px-5 py-12">
    <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 md:items-center">
      <div className="grid aspect-square grid-cols-2 grid-rows-2 gap-2 overflow-hidden rounded-lg">
        <img src={performance} alt="NBA Josh in his black performance outfit" loading="lazy" className="row-span-2 size-full object-cover" />
        <img src={portrait.url} alt="NBA Josh portrait reference" loading="lazy" className="size-full object-cover" />
        <img src={character.url} alt="NBA Josh full-body reference" loading="lazy" className="size-full object-cover object-top" />
      </div>
      <div className="py-4">
        <p className="text-xs font-bold uppercase text-primary">Featured artist</p>
        <h2 className="mt-3 font-display text-5xl text-foreground">NBA Josh</h2>
        <p className="mt-3 text-sm text-muted-foreground">His identity. His wardrobe. His performance world.</p>
        <Button asChild className="mt-6"><Link to="/gallery">See his work<ArrowRight className="size-4" /></Link></Button>
      </div>
    </div>
  </section>;
}
import React from 'react';
import { Briefcase, Heart, Palmtree, Beer, Palette, Box } from 'lucide-react';
import { PhotoStyle, Testimonial } from './types';

export const LOGO_URL = "https://images.lucidchart.com/lucidchart/4d86c75a-7b3b-4876-a212-9c1692258838/images/0.png";

export const STYLE_OPTIONS = [
  {
    id: PhotoStyle.PROFESSIONAL,
    label: "Professional",
    description: "Sleek office backgrounds and business attire for LinkedIn and portfolios.",
    icon: <Briefcase className="w-6 h-6" />,
    sample: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: PhotoStyle.DATING,
    label: "Dating",
    description: "Warm, approachable portraits with soft lighting and stylish casual wear.",
    icon: <Heart className="w-6 h-6" />,
    sample: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: PhotoStyle.VACATION,
    label: "Vacation",
    description: "Exotic locations, sunny beaches, and relaxed vibes.",
    icon: <Palmtree className="w-6 h-6" />,
    sample: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: PhotoStyle.PARTY,
    label: "Party Shots",
    description: "High energy, night-out aesthetics with dynamic lighting and festive outfits.",
    icon: <Beer className="w-6 h-6" />,
    sample: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: PhotoStyle.ANIMATION_2D,
    label: "2D Animated Image",
    description: "Anime and hand-drawn illustrated styles inspired by modern studios.",
    icon: <Palette className="w-6 h-6" />,
    sample: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: PhotoStyle.ANIMATION_3D,
    label: "3D Animated Image",
    description: "Pixar-esque high-quality 3D renders with expressive features.",
    icon: <Box className="w-6 h-6" />,
    sample: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?auto=format&fit=crop&q=80&w=800"
  }
];

export interface EnhancedTestimonial extends Testimonial {
  before: string;
  after: string;
  stats: { label: string, value: string }[];
}

export const TESTIMONIALS: EnhancedTestimonial[] = [
  {
    name: "Alex Johnson",
    role: "Marketing Director",
    content: "ProShots transformed my selfie into a stunning LinkedIn headshot. The lighting and clothing details are mind-blowing.",
    avatar: "https://picsum.photos/seed/alex/100/100",
    before: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    after: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
    stats: [{ label: "Profile Views", value: "+420%" }, { label: "Quality", value: "HD" }]
  },
  {
    name: "Sarah Chen",
    role: "Freelance Designer",
    content: "I needed high-quality dating photos but didn't want to hire a photographer. ProShots delivered exactly the vibe I wanted.",
    avatar: "https://picsum.photos/seed/sarah/100/100",
    before: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400",
    after: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    stats: [{ label: "Matches", value: "3x" }, { label: "Style", value: "Natural" }]
  },
  {
    name: "Marcus Thorne",
    role: "Travel Vlogger",
    content: "The vacation style filters are incredible. I look like I'm on a private island even though I'm just in my living room.",
    avatar: "https://picsum.photos/seed/marcus/100/100",
    before: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400",
    after: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=400",
    stats: [{ label: "Realism", value: "99.8%" }, { label: "Time", value: "2min" }]
  }
];
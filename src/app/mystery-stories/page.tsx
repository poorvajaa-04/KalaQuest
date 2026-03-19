'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { states, type StateInfo, type ArtFormStory } from '@/lib/data';
import { Map, Palette, ArrowLeft } from 'lucide-react';

type PathChoice = 'A' | 'B' | null;

export default function MysteryStoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedState, setSelectedState] = useState<StateInfo | null>(null);
  const [selectedArtForm, setSelectedArtForm] = useState<ArtFormStory | null>(null);
  const [choice, setChoice] = useState<PathChoice>(null);

  useEffect(() => {
    const stateId = searchParams.get('state');
    const storyId = searchParams.get('story');

    if (!stateId) {
      return;
    }

    const matchedState = states.find((item) => item.id === stateId);
    if (!matchedState) {
      return;
    }

    setSelectedState(matchedState);

    if (!storyId) {
      setSelectedArtForm(null);
      setChoice(null);
      return;
    }

    const matchedStory = matchedState.artForms.find((item) => item.id === storyId);
    if (!matchedStory) {
      return;
    }

    setSelectedArtForm(matchedStory);
    setChoice(null);
  }, [searchParams]);

  function openState(state: StateInfo) {
    setSelectedState(state);
    setSelectedArtForm(null);
    setChoice(null);
    router.replace(`/mystery-stories?state=${state.id}`);
  }

  function openStory(state: StateInfo, artForm: ArtFormStory) {
    setSelectedState(state);
    setSelectedArtForm(artForm);
    setChoice(null);
    router.replace(`/mystery-stories?state=${state.id}&story=${artForm.id}`);
  }

  function goBackToStates() {
    setSelectedState(null);
    setSelectedArtForm(null);
    setChoice(null);
    router.replace('/mystery-stories');
  }

  function goBackToArtForms() {
    if (!selectedState) {
      goBackToStates();
      return;
    }

    setSelectedArtForm(null);
    setChoice(null);
    router.replace(`/mystery-stories?state=${selectedState.id}`);
  }

  if (selectedArtForm && selectedState) {
    const storyMoments = selectedArtForm.story;
    const introduction = `You are a young artisan from ${selectedState.name}, learning ${selectedArtForm.name} from elders in your family workshop. Every motif, rhythm, and material carries memory from generations who kept this tradition alive through their hands.`;
    const origin = `${selectedArtForm.name} grew through community-led artisan traditions in ${selectedState.name}, where knowledge passed through practice, oral teaching, and patient craftsmanship.`;
    const situation = `Before festival season, a city buyer offers a large order with one condition: produce fast with shortcuts. Your mentor asks you to decide what kind of artisan you want to become.`;

    const pathA = [
      'You accept the fast order so your family can earn immediately.',
      'The workshop is busy and money comes in, but simplified patterns slowly replace handmade depth and signature detail.',
      `You realize ${selectedArtForm.name} is not only a product. It is a cultural voice shaped by artisan discipline, local materials, and inherited skill.`
    ];

    const pathB = [
      'You choose slower, traditional methods, even with fewer pieces to sell right now.',
      'You spend extra hours mastering foundational techniques, understanding why motifs and process matter in the artisan lineage.',
      `Your work gains respect for authenticity, and younger learners begin to see ${selectedArtForm.name} as a living tradition, not just a market item.`
    ];

    const reflection = `You sit with your finished work and understand that heritage survives when artisans choose care over erasure. Preserving ${selectedArtForm.name} in ${selectedState.name} means protecting memory, identity, and dignity for the next generation.`;

    return (
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <Button
          variant="outline"
          onClick={goBackToArtForms}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Art Forms
        </Button>

        <Card className="w-full parchment">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl md:text-4xl">Choose Your Path: {selectedArtForm.name}</CardTitle>
            <CardDescription className="text-lg">{selectedState.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-w-4xl mx-auto text-base md:text-lg font-body text-foreground/90">
              <div className="flex items-center gap-4 justify-center">
                <Palette className="h-8 w-8 text-accent" />
                <h3 className="font-headline text-2xl md:text-3xl">Interactive Story</h3>
              </div>

              <div className="space-y-3">
                <h4 className="font-headline text-xl">1. Mystery Story</h4>
                {storyMoments.map((line, index) => (
                  <p key={`${selectedArtForm.id}-story-${index}`}>{line}</p>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="font-headline text-xl">2. Introduction</h4>
                <p>{introduction}</p>
                <p>{origin}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-headline text-xl">3. Situation</h4>
                <p>{situation}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-headline text-xl">4. Choose</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant={choice === 'A' ? 'default' : 'outline'} onClick={() => setChoice('A')}>
                    A. Fast order and shortcuts
                  </Button>
                  <Button variant={choice === 'B' ? 'default' : 'outline'} onClick={() => setChoice('B')}>
                    B. Traditional method and fewer pieces
                  </Button>
                </div>
              </div>

              {choice === 'A' && (
                <div className="space-y-3">
                  <h4 className="font-headline text-xl">5A. Your Path</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {pathA.map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}

              {choice === 'B' && (
                <div className="space-y-3">
                  <h4 className="font-headline text-xl">5B. Your Path</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {pathB.map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}

              {choice && (
                <div className="space-y-3">
                  <h4 className="font-headline text-xl">6. Reflection</h4>
                  <p>{reflection}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedState) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <Button
          variant="outline"
          onClick={goBackToStates}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to States
        </Button>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline tracking-wide">Ancient Art Forms of {selectedState.name}</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
            Select an art form to start a Choose Your Path story as a young artisan.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {selectedState.artForms.map((artForm) => (
            <button
              key={artForm.id}
              onClick={() => openStory(selectedState, artForm)}
              className="text-left h-full"
            >
              <Card className="parchment text-center flex flex-col items-center justify-center p-6 h-full transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-primary">
                <Palette className="h-10 w-10 text-primary mb-3" />
                <CardTitle className="font-headline text-xl flex-grow">{artForm.name}</CardTitle>
                <CardDescription className="mt-2 text-sm">{artForm.story[0]}</CardDescription>
              </Card>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline tracking-wide">Mystery Stories & Fun Facts</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
          Choose a state and play as a young artisan learning traditional craft pathways.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {states.map((item) => (
          <button
            key={item.id}
            onClick={() => openState(item)}
            className="text-left h-full"
          >
            <Card className="parchment text-center flex flex-col items-center justify-center p-4 h-full transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-primary">
              <Map className="h-10 w-10 text-primary mb-3" />
              <CardTitle className="font-headline text-xl">{item.name}</CardTitle>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

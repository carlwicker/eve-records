interface TrackButtonProps {
  handlePlay: any;
  artist: string;
  title: string;
  playAudio: boolean;
  trackNumber?: number | undefined;
  setTrackNumber?: (trackNumber: number) => void;
  onClick?: (number: number) => void; // Add this line
}

export default function TrackButton({
  handlePlay,
  artist,
  title,
  trackNumber,
  playAudio,
  setTrackNumber,
}: TrackButtonProps) {
  return (
    <>
      {!playAudio && (
        <div
          className="p-5 bg-red-800 text-[#EEE] text-sm relative z-10 hover:bg-red-900 w-full uppercase"
          onClick={() => {
            handlePlay(trackNumber);
          }}
        >
          {artist}
        </div>
      )}
    </>
  );
}

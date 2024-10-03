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
        <button
          className="p-5 bg-red-900 text-[#EEE] relative z-10"
          onClick={() => {
            handlePlay(trackNumber);
          }}
        >
          Track {trackNumber}: {artist} - {title}
        </button>
      )}
    </>
  );
}

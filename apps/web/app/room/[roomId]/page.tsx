import RoomDetailSection from './_components/RoomDetailSection';

type RoomDetailPageProps = {
  params: Promise<{ roomId: string }>;
};

async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { roomId } = await params;

  return <RoomDetailSection roomId={roomId} />;
}

export default RoomDetailPage;

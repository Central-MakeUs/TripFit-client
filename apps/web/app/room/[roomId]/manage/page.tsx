import RoomManageSection from './_components/RoomManageSection';

type RoomManagePageProps = {
  params: Promise<{ roomId: string }>;
};

async function RoomManagePage({ params }: RoomManagePageProps) {
  const { roomId } = await params;

  return <RoomManageSection roomId={roomId} />;
}

export default RoomManagePage;

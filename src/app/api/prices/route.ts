import { coincapApi } from '@/services/coincapApi';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  const encoder = new TextEncoder();
  let isConnected = true;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Function to fetch and send price updates
        const sendPriceUpdate = async () => {
          if (!isConnected) return;

          try {
            const assets = await coincapApi.getTopAssets(20);
            const data = JSON.stringify({ assets });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          } catch (error) {
            // Log error but don't kill the stream
            console.error('Price update error:', error);
            if (isConnected) {
              const errorMessage = error instanceof Error ? error.message : 'Price update failed';
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
              );
            }
          }
        };

        // Send initial data
        await sendPriceUpdate();

        // Set up interval for updates
        // const intervalId = setInterval(sendPriceUpdate, 30000);

        // Clean up on client disconnect
        return () => {
          isConnected = false;
          // clearInterval(intervalId);
        };
      } catch (error) {
        isConnected = false;
        controller.error(error);
      }
    },
    cancel() {
      isConnected = false;
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
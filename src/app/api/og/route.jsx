import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        // Extract params
        const p1Name = searchParams.get('p1Name') || 'Player 1';
        const p1Avatar = searchParams.get('p1Avatar');
        const p2Name = searchParams.get('p2Name') || 'Player 2';
        const p2Avatar = searchParams.get('p2Avatar');
        const tournamentName = searchParams.get('tName') || 'RAID Tournament';
        const round = searchParams.get('round') || '1';
        const mode = searchParams.get('mode') || 'match'; // 'match' or 'tournament'

        // Font loading (optional, using default fonts for speed/reliability first)

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0a0a0b',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Background Gradient */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(to bottom, #1a1a1a, #000000)',
                            zIndex: 0,
                        }}
                    />

                    {/* Glow Effects */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '20%',
                            left: '20%',
                            width: '400px',
                            height: '400px',
                            background: 'rgba(234, 88, 12, 0.2)', // Orange
                            filter: 'blur(100px)',
                            borderRadius: '50%',
                            zIndex: 1,
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '20%',
                            right: '20%',
                            width: '400px',
                            height: '400px',
                            background: 'rgba(37, 99, 235, 0.2)', // Blue
                            filter: 'blur(100px)',
                            borderRadius: '50%',
                            zIndex: 1,
                        }}
                    />

                    {/* Grid Pattern Overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                            backgroundSize: '50px 50px',
                            zIndex: 1,
                            opacity: 0.2
                        }}
                    />

                    {/* Main Content Container */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, width: '100%' }}>

                        {/* Tournament Header */}
                        <div
                            style={{
                                backgroundColor: '#fff',
                                color: '#000',
                                padding: '10px 30px',
                                fontSize: 24,
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                transform: 'skew(-12deg)',
                                marginBottom: 60,
                                boxShadow: '5px 5px 0px #ea580c',
                                letterSpacing: '2px',
                            }}
                        >
                            {tournamentName.length > 25 ? tournamentName.substring(0, 25) + '...' : tournamentName}
                        </div>

                        {/* Players Row */}
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '60px' }}>

                            {/* Player 1 */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: 200,
                                    height: 200,
                                    borderRadius: 24,
                                    overflow: 'hidden',
                                    border: '8px solid rgba(234, 88, 12, 0.6)', // Orange border
                                    boxShadow: '0 0 40px rgba(234, 88, 12, 0.4)',
                                    backgroundColor: '#1f1f1f',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {p1Avatar ? (
                                        <img src={p1Avatar} width="200" height="200" style={{ objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ color: '#ea580c', fontSize: 80, fontWeight: 900 }}>{p1Name.charAt(0)}</div>
                                    )}
                                </div>
                                <div style={{ marginTop: 20, fontSize: 40, fontWeight: 900, color: 'white', textTransform: 'uppercase', fontStyle: 'italic', textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}>
                                    {p1Name}
                                </div>
                            </div>

                            {/* VS Badge */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 20px' }}>
                                <div style={{
                                    fontSize: 120,
                                    fontWeight: 900,
                                    background: 'linear-gradient(to bottom, #ffffff, #ea580c, #991b1b)',
                                    backgroundClip: 'text',
                                    color: 'transparent',
                                    fontStyle: 'italic',
                                    lineHeight: 1,
                                    filter: 'drop-shadow(0 0 20px rgba(234, 88, 12, 0.8))'
                                }}>
                                    VS
                                </div>
                                <div style={{
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    padding: '5px 15px',
                                    fontSize: 18,
                                    fontWeight: 900,
                                    transform: 'skew(-12deg)',
                                    marginTop: -10,
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                                }}>
                                    MAIN EVENT
                                </div>
                            </div>

                            {/* Player 2 */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: 200,
                                    height: 200,
                                    borderRadius: 24,
                                    overflow: 'hidden',
                                    border: '8px solid rgba(59, 130, 246, 0.6)', // Blue border
                                    boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)',
                                    backgroundColor: '#1f1f1f',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {p2Avatar ? (
                                        <img src={p2Avatar} width="200" height="200" style={{ objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ color: '#3b82f6', fontSize: 80, fontWeight: 900 }}>{p2Name.charAt(0)}</div>
                                    )}
                                </div>
                                <div style={{ marginTop: 20, fontSize: 40, fontWeight: 900, color: 'white', textTransform: 'uppercase', fontStyle: 'italic', textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}>
                                    {p2Name}
                                </div>
                            </div>

                        </div>

                        {/* Footer Badge */}
                        <div style={{
                            marginTop: 60,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 50,
                            padding: '10px 40px',
                            color: 'white',
                            fontSize: 20,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}>
                            <span style={{ color: '#ea580c' }}>⚔️</span> {mode === 'match' ? `ROUND ${round} • LIVE ON RAID` : 'TOURNAMENT LIVE'}
                        </div>

                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}

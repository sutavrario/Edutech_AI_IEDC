import re
from typing import Dict, Optional

def extract_youtube_info(url: str) -> Optional[Dict[str, str]]:
    """
    Extracts the YouTube video ID from various formats of YouTube URLs and 
    generates the embed URL and thumbnail URL.
    
    Supported formats:
    - https://www.youtube.com/watch?v=abc12345678
    - https://youtu.be/abc12345678
    - https://www.youtube.com/embed/abc12345678
    - https://youtube.com/shorts/abc12345678
    """
    if not url:
        return None

    # Regex pattern to match various YouTube URL formats and capture the 11-char ID
    pattern = r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})'
    
    match = re.search(pattern, url)
    if not match:
        return None
        
    video_id = match.group(1)
    
    return {
        "video_id": video_id,
        "embed_url": f"https://www.youtube.com/embed/{video_id}",
        "thumbnail_url": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
    }

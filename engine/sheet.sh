#!/bin/zsh
# engine/sheet.sh out.jpg COLS PLATE img1.png img2.png ...   (PLATE "-" = grey). Tiles stills (alpha composited) at 640 px.
out=$1; cols=$2; plate=$3; shift 3
tmp=$(mktemp -d); i=0
for f in "$@"; do i=$((i+1)); n=$(printf "%03d" $i)
  if [[ $plate == "-" ]]; then ffmpeg -v error -f lavfi -i color=c=0x3c3c3c:s=1920x1080 -i "$f" -filter_complex "[0][1]overlay,scale=640:-1" -frames:v 1 -y $tmp/$n.png
  else ffmpeg -v error -i "$plate" -i "$f" -filter_complex "[0]scale=1920:1080[b];[1]scale=1920:1080[a];[b][a]overlay,scale=640:-1" -frames:v 1 -y $tmp/$n.png; fi
done
rows=$(( (i + cols - 1) / cols ))
ffmpeg -v error -framerate 1 -i $tmp/%03d.png -vf "tile=${cols}x${rows}:padding=4:color=0x141414" -frames:v 1 -q:v 3 -y "$out"
rm -rf $tmp; echo "$out"

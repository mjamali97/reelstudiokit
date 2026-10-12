// ocrfind <image> "<phrase>" [yFrom yTo]
// Prints the pixel box (x y w h, top-left origin) of every occurrence of <phrase>
// found by macOS Vision OCR. Used to place b-roll highlights on real captures.
import Foundation
import Vision
import AppKit

let a = CommandLine.arguments
guard a.count >= 3, let img = NSImage(contentsOfFile: a[1]),
      let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    fputs("usage: ocrfind <image> <phrase> [yFrom yTo]\n", stderr); exit(2)
}
let phrase = a[2].lowercased()
let y0 = a.count > 3 ? Int(a[3])! : 0, y1 = a.count > 4 ? Int(a[4])! : cg.height
let W = CGFloat(cg.width), H = CGFloat(cg.height)
// Vision limits very tall images; process in overlapping horizontal bands.
let band = 2400, overlap = 200
var seen = Set<String>()
var y = y0
while y < y1 {
    let h = min(band, y1 - y)
    guard let crop = cg.cropping(to: CGRect(x: 0, y: y, width: cg.width, height: h)) else { break }
    let req = VNRecognizeTextRequest()
    req.recognitionLevel = .accurate
    req.usesLanguageCorrection = false
    try? VNImageRequestHandler(cgImage: crop, options: [:]).perform([req])
    for obs in req.results ?? [] {
        guard let cand = obs.topCandidates(1).first else { continue }
        let s = cand.string, low = s.lowercased()
        var from = low.startIndex
        while let r = low.range(of: phrase, range: from..<low.endIndex) {
            let rr = Range(uncheckedBounds: (s.index(s.startIndex, offsetBy: low.distance(from: low.startIndex, to: r.lowerBound)),
                                             s.index(s.startIndex, offsetBy: low.distance(from: low.startIndex, to: r.upperBound))))
            if let bb = try? cand.boundingBox(for: rr)?.boundingBox {
                let px = Int(bb.minX * W), pw = Int(bb.width * W)
                let ph = Int(bb.height * CGFloat(h)), py = y + Int((1 - bb.maxY) * CGFloat(h))
                let key = "\(px/6),\(py/6)"
                if !seen.contains(key) { seen.insert(key); print("\(px) \(py) \(pw) \(ph)\t\(s)") }
            }
            from = r.upperBound
        }
    }
    if y + h >= y1 { break }
    y += band - overlap
}

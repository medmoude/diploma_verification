import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import '../services/api_service.dart';
import 'result_screen.dart';

class ScanQRScreen extends StatefulWidget {
  @override
  _ScanQRScreenState createState() => _ScanQRScreenState();
}

class _ScanQRScreenState extends State<ScanQRScreen> {
  MobileScannerController controller = MobileScannerController();
  bool isScanned = false;
  bool permissionGranted = false;

  @override
  void initState() {
    super.initState();
    _requestPermission();
  }

  Future<void> _requestPermission() async {
    final status = await Permission.camera.request();
    setState(() {
      permissionGranted = status.isGranted;
    });
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text("Scanner le QR Code"),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: !permissionGranted
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.camera_alt_outlined,
                    size: 80,
                    color: Colors.white54,
                  ),
                  SizedBox(height: 16),
                  Text(
                    "Permission caméra requise",
                    style: TextStyle(color: Colors.white, fontSize: 18),
                  ),
                  SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _requestPermission,
                    icon: Icon(Icons.settings),
                    label: Text("Autoriser la caméra"),
                  ),
                ],
              ),
            )
          : Stack(
              children: [
                MobileScanner(
                  controller: controller,
                  onDetect: (capture) async {
                    if (isScanned) return;
                    setState(() => isScanned = true);

                    final barcode = capture.barcodes.first;
                    final url = barcode.rawValue;

                    if (url == null) {
                      setState(() => isScanned = false);
                      return;
                    }

                    // Extract UUID from URL
                    final uuid = url.split("/").where((s) => s.isNotEmpty).last;

                    try {
                      final data = await ApiService.verifyByUuid(uuid);
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ResultScreen(data: data),
                        ),
                      );
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text("Erreur: ${e.toString()}")),
                      );
                      setState(() => isScanned = false);
                    }
                  },
                ),
                // Scan overlay
                Center(
                  child: Container(
                    width: 250,
                    height: 250,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.white, width: 3),
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 40,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: Text(
                      "Positionnez le QR code dans le cadre",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        backgroundColor: Colors.black54,
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}

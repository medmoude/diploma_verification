import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:receive_sharing_intent/receive_sharing_intent.dart';
import '../services/api_service.dart';
import 'result_screen.dart';

/// This widget wraps your Home screen to listen for incoming files globally
class ShareHandlerWrapper extends StatefulWidget {
  final Widget child;

  const ShareHandlerWrapper({Key? key, required this.child}) : super(key: key);

  @override
  _ShareHandlerWrapperState createState() => _ShareHandlerWrapperState();
}

class _ShareHandlerWrapperState extends State<ShareHandlerWrapper> {
  late StreamSubscription _intentDataStreamSubscription;

  @override
  void initState() {
    super.initState();

    // 1. Listen for files while the app is already running in memory
    _intentDataStreamSubscription = ReceiveSharingIntent.instance
        .getMediaStream()
        .listen((List<SharedMediaFile> value) {
      if (value.isNotEmpty) {
        _handleSharedFile(value.first);
      }
    }, onError: (err) {
      print("getIntentDataStream error: $err");
    });

    // 2. Listen for files when the app is closed and launched via sharing
    ReceiveSharingIntent.instance
        .getInitialMedia()
        .then((List<SharedMediaFile> value) {
      if (value.isNotEmpty) {
        _handleSharedFile(value.first);
      }
    });
  }

  @override
  void dispose() {
    _intentDataStreamSubscription.cancel();
    super.dispose();
  }

  // Common function to process the file
  void _handleSharedFile(SharedMediaFile sharedFile) {
    // Navigate to a temporary loading screen that performs the check
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => VerifySharedFileScreen(filePath: sharedFile.path),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}

/// A simple screen to show "Verifying..." while API calls happen
class VerifySharedFileScreen extends StatefulWidget {
  final String filePath;

  const VerifySharedFileScreen({Key? key, required this.filePath})
      : super(key: key);

  @override
  _VerifySharedFileScreenState createState() => _VerifySharedFileScreenState();
}

class _VerifySharedFileScreenState extends State<VerifySharedFileScreen> {
  @override
  void initState() {
    super.initState();
    _verifyFile();
  }

  Future<void> _verifyFile() async {
    try {
      // 1. Convert path to File object
      // Remove 'file://' prefix if present (common issue on some platforms)
      String cleanPath = widget.filePath.replaceFirst('file://', '');
      File file = File(cleanPath);

      // 2. Call your existing API Service
      final data = await ApiService.verifyPdf(file);

      // 3. Navigate to Result Screen (Replace this loading screen)
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => ResultScreen(data: data)),
        );
      }
    } catch (e) {
      if (mounted) {
        // Go back if error and show snackbar
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text("Erreur lors du partage: $e"),
              backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 20),
            Text(
              "Réception du diplôme...",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            Text(
              "Vérification de l'authenticité en cours",
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}

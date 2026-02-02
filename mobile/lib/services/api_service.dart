import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

const baseUrl = "http://10.9.164.15:8000/api";

class ApiService {
  static Future<Map<String, dynamic>> verifyByUuid(String uuid) async {
    try {
      final res = await http
          .get(Uri.parse("$baseUrl/verify/$uuid/"))
          .timeout(Duration(seconds: 10));

      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      } else if (res.statusCode == 404 || res.statusCode == 410) {
        return jsonDecode(res.body);
      } else {
        throw Exception("Erreur serveur: ${res.statusCode}");
      }
    } catch (e) {
      throw Exception("Erreur de connexion: ${e.toString()}");
    }
  }

  static Future<Map<String, dynamic>> verifyPdf(File file) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse("$baseUrl/verify-file/"),
      );

      request.files.add(await http.MultipartFile.fromPath("file", file.path));

      var response = await request.send().timeout(Duration(seconds: 30));
      var body = await response.stream.bytesToString();

      if (response.statusCode == 200) {
        return jsonDecode(body);
      } else if (response.statusCode == 400 ||
          response.statusCode == 404 ||
          response.statusCode == 410) {
        return jsonDecode(body);
      } else {
        throw Exception("Erreur serveur: ${response.statusCode}");
      }
    } catch (e) {
      throw Exception("Erreur de vérification: ${e.toString()}");
    }
  }
}

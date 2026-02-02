import 'package:flutter/material.dart';

class ResultScreen extends StatelessWidget {
  final Map data;
  ResultScreen({required this.data});

  @override
  Widget build(BuildContext context) {
    final valid = data["valid"] ?? false;

    return Scaffold(
      appBar: AppBar(title: Text("Résultat de vérification")),
      body: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: valid
                ? [Color(0xFFECFDF5), Color(0xFFD1FAE5)]
                : [Color(0xFFFEF2F2), Color(0xFFFEE2E2)],
          ),
        ),
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: valid ? Colors.green.shade200 : Colors.red.shade200,
                  width: 2,
                ),
              ),
              child: Padding(
                padding: EdgeInsets.all(32),
                child: valid ? _buildValidContent() : _buildInvalidContent(),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildValidContent() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            color: Colors.green.shade100,
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.verified, size: 60, color: Colors.green),
        ),
        SizedBox(height: 24),
        Text(
          "Diplôme authentique",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.green.shade800,
          ),
        ),
        SizedBox(height: 8),
        Container(
          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.green.shade50,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.lock, size: 14, color: Colors.green.shade700),
              SizedBox(width: 4),
              Text(
                "Vérifié et sécurisé",
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.green.shade700,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: 32),
        _buildInfoCard(Icons.person, "Nom", data["nom"] ?? "—"),
        SizedBox(height: 12),
        _buildInfoCard(Icons.school, "Filière", data["filiere"] ?? "—"),
        SizedBox(height: 12),
        _buildInfoCard(
          Icons.calendar_today,
          "Année",
          data["annee"]?.toString() ?? "—",
        ),
        if (data["matricule"] != null) ...[
          SizedBox(height: 12),
          _buildInfoCard(
            Icons.badge,
            "Matricule",
            data["matricule"]?.toString() ?? "—",
          ),
        ],
      ],
    );
  }

  Widget _buildInvalidContent() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            color: Colors.red.shade100,
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.error, size: 60, color: Colors.red),
        ),
        SizedBox(height: 24),
        Text(
          "Diplôme invalide",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.red.shade800,
          ),
        ),
        SizedBox(height: 16),
        Container(
          padding: EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.red.shade50,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(Icons.warning_amber, color: Colors.red.shade700),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  data["error"] ?? "Ce diplôme n'a pas pu être vérifié",
                  style: TextStyle(color: Colors.red.shade700, fontSize: 14),
                ),
              ),
            ],
          ),
        ),
        if (data["raison_annulation"] != null) ...[
          SizedBox(height: 16),
          Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.orange.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.orange.shade200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.block, size: 18, color: Colors.orange.shade700),
                    SizedBox(width: 8),
                    Text(
                      "Raison d'annulation:",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.orange.shade700,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 8),
                Text(
                  data["raison_annulation"],
                  style: TextStyle(color: Colors.orange.shade700),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildInfoCard(IconData icon, String label, String value) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.blue.shade100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: Colors.blue, size: 20),
          ),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
                SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

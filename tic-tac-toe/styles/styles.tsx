import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  
  /* ==================== MENÚ ==================== */
  menuContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 20,
  },
  menuButton: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  menuButtonSubtext: {
    fontSize: 14,
    color: '#e0f2e9',
  },

  /* ==================== HEADER ==================== */
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#333',
  },

  /* ==================== LAYOUT PRINCIPAL ==================== */
  mainRow: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  leftColumn: {
    flex: 1,
    minWidth: 300,
    alignItems: 'center',
  },
  
  /* ==================== STATUS ==================== */
  status: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    color: '#2c3e50',
  },

  /* ==================== TABLERO ==================== */
  board: {
    backgroundColor: '#ecf0f1',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boardRow: {
    flexDirection: 'row',
  },
  square: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    margin: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#bdc3c7',
  },
  squareHighlight: {
    backgroundColor: '#fff9c4',
    borderColor: '#f39c12',
    borderWidth: 3,
  },
  squareText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2c3e50',
  },

  /* ==================== CONTROLES ==================== */
  controls: {
    flex: 1,
    minWidth: 250,
    maxWidth: 350,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  
  /* ==================== TAMAÑO DEL TABLERO ==================== */
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  sizeBtn: {
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  sizeBtnText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  sizeInput: {
    flex: 1,
    height: 40,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    backgroundColor: '#fff',
  },
  sizeSelector: {
    marginBottom: 20,
  },
  sizeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  sizeOptionActive: {
    borderColor: '#3498db',
    backgroundColor: '#e3f2fd',
  },
  sizeOptionText: {
    fontSize: 14,
    color: '#666',
  },
  sizeOptionTextActive: {
    color: '#3498db',
    fontWeight: 'bold',
  },

  /* ==================== BOTONES ==================== */
  buttonsRow: {
    gap: 10,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  smallBtn: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  smallBtnAlt: {
    backgroundColor: '#e67e22',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  smallBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resetStatsBtn: {
    backgroundColor: '#95a5a6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  resetStatsBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  /* ==================== INFO ROW ==================== */
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
    width: '100%',
  },

  /* ==================== ESTADÍSTICAS ==================== */
  stats: {
    marginBottom: 20,
  },
  statText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },

  /* ==================== ONLINE ESPECÍFICO ==================== */
  waitingContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
  },
  waitingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  loadingText: {
    fontSize: 18,
    color: '#555',
    marginTop: 15,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    maxWidth: 600,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  gameInfo: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  symbolIndicator: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  infoTextBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  symbolText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
});
import os
import azure.cognitiveservices.speech as speechsdk


def text_to_speech(text, wav_path, speaker='zh-CN-XiaochenNeural') -> None:
    speech_config = speechsdk.SpeechConfig(subscription=os.environ.get(
        'AZURE_KEY'), region=os.environ.get('AZURE_SPEECH_REGION'))
    audio_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=True)

    speech_config.speech_synthesis_voice_name = speaker

    speech_synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config, audio_config=audio_config)
    speech_synthesis_result = speech_synthesizer.speak_text_async(text).get()

    assert speech_synthesis_result, "Speech synthesis failed, no result"

    if speech_synthesis_result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        print("Speech synthesized for text [{}]".format(text))
        stream = speechsdk.AudioDataStream(speech_synthesis_result)
        stream.save_to_wav_file(wav_path)
    elif speech_synthesis_result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = speech_synthesis_result.cancellation_details
        print("Speech synthesis canceled: {}".format(
            cancellation_details.reason))
        if cancellation_details.reason == speechsdk.CancellationReason.Error and cancellation_details.error_details:
            print("Error details: {}".format(
                cancellation_details.error_details))


if __name__ == '__main__':
    text_to_speech('a', 'a')
